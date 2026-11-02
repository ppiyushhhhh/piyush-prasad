import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CredlyBadge = Database["public"]["Tables"]["credly_badges"]["Row"];
export type CredlyBadgeInsert = Database["public"]["Tables"]["credly_badges"]["Insert"];
export type CredlyBadgeUpdate = Database["public"]["Tables"]["credly_badges"]["Update"];

export interface CredlyBadgeInput {
  name: string;
  issuer: string;
  description?: string | null;
  badge_image_url: string;
  badge_storage_path?: string | null;
  credly_url: string;
  issue_date: string;
  expiry_date?: string | null;
  skills: string[];
  is_published?: boolean;
  display_order?: number;
}

export const CREDLY_STORAGE_BUCKET = "credly-badges";
export const MAX_BADGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"];

/**
 * Fallback static badge data matching Piyush's portfolio credentials
 * in case Supabase table is temporarily unavailable or empty.
 */
export const FALLBACK_CREDLY_BADGES: CredlyBadge[] = [
  {
    id: "fallback-aws-cloud-essentials",
    name: "AWS Knowledge: Cloud Essentials",
    issuer: "Amazon Web Services Training and Certification",
    description:
      "Earners of this badge have demonstrated foundational knowledge of AWS Cloud concepts, security, architecture, pricing, and support services.",
    badge_image_url:
      "https://images.credly.com/images/b9feab85-1a43-4f6c-99a5-631b88d52024/image.png",
    badge_storage_path: null,
    credly_url:
      "https://www.credly.com/badges/1d7245e6-ebba-4b7b-970f-ad1d214a1c91/linked_in_profile",
    issue_date: "2024-04-15",
    expiry_date: null,
    skills: ["AWS Cloud", "Cloud Architecture", "Cloud Security", "Cost Management"],
    is_published: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Sanitize SVG content to prevent XSS and XML entity attacks.
 */
export function sanitizeSvgContent(rawSvg: string): {
  safe: boolean;
  sanitizedSvg?: string;
  error?: string;
} {
  // Reject entity declarations (XXE vulnerability protection)
  if (/<!ENTITY/i.test(rawSvg) || /<!DOCTYPE[^>]*SYSTEM/i.test(rawSvg)) {
    return { safe: false, error: "SVG contains disallowed XML entity declarations." };
  }

  // Reject script tags and external foreign objects
  if (
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(rawSvg) ||
    /<script/i.test(rawSvg)
  ) {
    return { safe: false, error: "SVG contains unsafe <script> elements." };
  }

  if (/<foreignObject\b/i.test(rawSvg)) {
    return { safe: false, error: "SVG contains unsafe <foreignObject> elements." };
  }

  // Reject inline javascript: protocols in attributes (href, xlink:href, etc.)
  if (
    /href\s*=\s*['"]\s*javascript:/i.test(rawSvg) ||
    /xlink:href\s*=\s*['"]\s*javascript:/i.test(rawSvg)
  ) {
    return { safe: false, error: "SVG contains unsafe javascript: URIs." };
  }

  // Strip or reject event handlers (e.g., onload=, onerror=, onclick=)
  if (/\bon[a-z]+\s*=/i.test(rawSvg)) {
    return { safe: false, error: "SVG contains inline DOM event handlers." };
  }

  return { safe: true, sanitizedSvg: rawSvg };
}

/**
 * Validates a file before upload.
 */
export async function validateBadgeFile(file: File): Promise<{
  valid: boolean;
  error?: string;
  sanitizedFile?: File;
}> {
  if (file.size > MAX_BADGE_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${(MAX_BADGE_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB limit. Selected size: ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension .${ext}. Only PNG, JPEG, WebP, and SVG are accepted.`,
    };
  }

  if (ext === "svg" || file.type.includes("svg")) {
    try {
      const text = await file.text();
      const check = sanitizeSvgContent(text);
      if (!check.safe) {
        return { valid: false, error: check.error };
      }
      const safeBlob = new Blob([check.sanitizedSvg ?? text], { type: "image/svg+xml" });
      const safeFile = new File([safeBlob], file.name, { type: "image/svg+xml" });
      return { valid: true, sanitizedFile: safeFile };
    } catch {
      return { valid: false, error: "Could not read or parse SVG file." };
    }
  }

  return { valid: true, sanitizedFile: file };
}

/**
 * Upload badge image to Supabase Storage bucket 'credly-badges',
 * with an automatic base64 Data URL fallback so upload never fails.
 */
export async function uploadBadgeImage(
  file: File,
): Promise<{ url: string; storagePath: string | null; isLocal: boolean }> {
  const validation = await validateBadgeFile(file);
  if (!validation.valid || !validation.sanitizedFile) {
    throw new Error(validation.error || "Invalid file for badge upload");
  }

  const uploadFile = validation.sanitizedFile;

  // Convert to high-fidelity Data URL first (guarantees immediate display & offline resilience)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image data"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(uploadFile);
  });

  const ext = uploadFile.name.split(".").pop()?.toLowerCase() || "png";
  const uniqueId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 12);
  const cleanBaseName = uploadFile.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 30);
  const storagePath = `badges/${Date.now()}-${cleanBaseName}-${uniqueId}.${ext}`;

  // Attempt Supabase storage upload if available
  try {
    const { error: uploadError } = await supabase.storage
      .from(CREDLY_STORAGE_BUCKET)
      .upload(storagePath, uploadFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: uploadFile.type || "image/png",
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from(CREDLY_STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      if (publicUrlData?.publicUrl) {
        return {
          url: publicUrlData.publicUrl,
          storagePath,
          isLocal: false,
        };
      }
    } else {
      console.warn("[Credly Storage] Supabase bucket upload bypassed:", uploadError.message);
    }
  } catch (err) {
    console.warn("[Credly Storage] Supabase storage unavailable, using local image:", err);
  }

  // Gracefully use dataUrl so user is never blocked by storage errors
  return {
    url: dataUrl,
    storagePath: null,
    isLocal: true,
  };
}

/**
 * Delete a file from the credly-badges storage bucket.
 */
export async function deleteBadgeStorageFile(storagePath?: string | null): Promise<void> {
  if (!storagePath) return;
  try {
    const { error } = await supabase.storage.from(CREDLY_STORAGE_BUCKET).remove([storagePath]);
    if (error) {
      console.warn(`[Credly Storage] Failed to remove obsolete image: ${storagePath}`, error);
    }
  } catch (err) {
    console.warn(`[Credly Storage] Error during file deletion:`, err);
  }
}

const STORAGE_KEY = "piyush_credly_badges";

/**
 * Get badges from local persistence if Supabase table is empty or offline.
 */
export function getLocalBadges(): CredlyBadge[] {
  if (typeof window === "undefined") return FALLBACK_CREDLY_BADGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(FALLBACK_CREDLY_BADGES));
      return FALLBACK_CREDLY_BADGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : FALLBACK_CREDLY_BADGES;
  } catch {
    return FALLBACK_CREDLY_BADGES;
  }
}

/**
 * Save badges to local persistence.
 */
export function setLocalBadges(badges: CredlyBadge[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  } catch (err) {
    console.warn("[Credly Storage] Failed to write to localStorage:", err);
  }
}

/**
 * Fetch published badges for the public portfolio.
 * Prefers Supabase; gracefully falls back to local storage and static badges.
 */
export async function fetchPublishedBadges(): Promise<CredlyBadge[]> {
  try {
    const { data, error } = await supabase
      .from("credly_badges")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      // Sync local cache
      setLocalBadges(data);
      return data;
    }
  } catch (err) {
    console.warn("[Credly] Supabase query failed, falling back to local badges:", err);
  }

  // Fallback: return published badges from local persistence
  const local = getLocalBadges();
  return local.filter((b) => b.is_published);
}

/**
 * Fetch all badges (published and drafts) for admin dashboard.
 * Always ensures the admin sees the same registered badges as the portfolio.
 */
export async function fetchAllBadges(): Promise<CredlyBadge[]> {
  try {
    const { data, error } = await supabase
      .from("credly_badges")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      setLocalBadges(data);
      return data;
    }
  } catch (err) {
    console.warn("[Credly] Supabase query failed in fetchAllBadges, using local store:", err);
  }

  // Ensure local storage has at least the initial fallback badges so admin can view/edit
  return getLocalBadges();
}

/**
 * Create a new badge record.
 */
export async function createBadge(input: CredlyBadgeInput): Promise<CredlyBadge> {
  const currentBadges = getLocalBadges();
  let order = input.display_order ?? 0;
  if (order === 0) {
    order = currentBadges.length > 0 ? Math.max(...currentBadges.map((b) => b.display_order || 0)) + 1 : 1;
  }

  const newBadge: CredlyBadge = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `badge-${Date.now()}`,
    name: input.name.trim(),
    issuer: input.issuer.trim(),
    description: input.description?.trim() || null,
    badge_image_url: input.badge_image_url.trim(),
    badge_storage_path: input.badge_storage_path || null,
    credly_url: input.credly_url.trim(),
    issue_date: input.issue_date,
    expiry_date: input.expiry_date || null,
    skills: input.skills ?? [],
    is_published: input.is_published ?? true,
    display_order: order,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Try Supabase first
  try {
    const insertData: CredlyBadgeInsert = {
      name: newBadge.name,
      issuer: newBadge.issuer,
      description: newBadge.description,
      badge_image_url: newBadge.badge_image_url,
      badge_storage_path: newBadge.badge_storage_path,
      credly_url: newBadge.credly_url,
      issue_date: newBadge.issue_date,
      expiry_date: newBadge.expiry_date,
      skills: newBadge.skills,
      is_published: newBadge.is_published,
      display_order: newBadge.display_order,
    };

    const { data, error } = await supabase.from("credly_badges").insert(insertData).select().single();
    if (!error && data) {
      const updatedList = [...currentBadges.filter((b) => b.id !== data.id), data];
      setLocalBadges(updatedList);
      return data;
    }
  } catch (err) {
    console.warn("[Credly] Supabase insert failed, saving locally:", err);
  }

  // Save locally so the action succeeds
  const updatedList = [...currentBadges, newBadge];
  setLocalBadges(updatedList);
  return newBadge;
}

/**
 * Update an existing badge. If the image was replaced, deletes the previous storage file.
 */
export async function updateBadge(
  id: string,
  input: Partial<CredlyBadgeInput>,
  previousStoragePath?: string | null,
): Promise<CredlyBadge> {
  const currentBadges = getLocalBadges();
  const existingIndex = currentBadges.findIndex((b) => b.id === id);
  const existing = existingIndex !== -1 ? currentBadges[existingIndex] : null;

  const updatedBadge: CredlyBadge = {
    id,
    name: input.name !== undefined ? input.name.trim() : existing?.name ?? "",
    issuer: input.issuer !== undefined ? input.issuer.trim() : existing?.issuer ?? "",
    description: input.description !== undefined ? input.description?.trim() || null : existing?.description ?? null,
    badge_image_url: input.badge_image_url !== undefined ? input.badge_image_url.trim() : existing?.badge_image_url ?? "",
    badge_storage_path: input.badge_storage_path !== undefined ? input.badge_storage_path : existing?.badge_storage_path ?? null,
    credly_url: input.credly_url !== undefined ? input.credly_url.trim() : existing?.credly_url ?? "",
    issue_date: input.issue_date !== undefined ? input.issue_date : existing?.issue_date ?? new Date().toISOString().split("T")[0],
    expiry_date: input.expiry_date !== undefined ? input.expiry_date || null : existing?.expiry_date ?? null,
    skills: input.skills !== undefined ? input.skills : existing?.skills ?? [],
    is_published: input.is_published !== undefined ? input.is_published : existing?.is_published ?? true,
    display_order: input.display_order !== undefined ? input.display_order : existing?.display_order ?? 1,
    created_at: existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const updateData: CredlyBadgeUpdate = {
      name: updatedBadge.name,
      issuer: updatedBadge.issuer,
      description: updatedBadge.description,
      badge_image_url: updatedBadge.badge_image_url,
      badge_storage_path: updatedBadge.badge_storage_path,
      credly_url: updatedBadge.credly_url,
      issue_date: updatedBadge.issue_date,
      expiry_date: updatedBadge.expiry_date,
      skills: updatedBadge.skills,
      is_published: updatedBadge.is_published,
      display_order: updatedBadge.display_order,
    };

    const { data, error } = await supabase.from("credly_badges").update(updateData).eq("id", id).select().single();
    if (!error && data) {
      if (input.badge_storage_path && previousStoragePath && input.badge_storage_path !== previousStoragePath) {
        await deleteBadgeStorageFile(previousStoragePath);
      }
      const updatedList = currentBadges.map((b) => (b.id === id ? data : b));
      setLocalBadges(updatedList);
      return data;
    }
  } catch (err) {
    console.warn("[Credly] Supabase update failed, saving locally:", err);
  }

  // Update locally
  const updatedList = currentBadges.map((b) => (b.id === id ? updatedBadge : b));
  setLocalBadges(updatedList);

  if (input.badge_storage_path && previousStoragePath && input.badge_storage_path !== previousStoragePath) {
    await deleteBadgeStorageFile(previousStoragePath);
  }

  return updatedBadge;
}

/**
 * Delete a badge and its associated storage file.
 */
export async function deleteBadge(id: string, storagePath?: string | null): Promise<void> {
  try {
    await supabase.from("credly_badges").delete().eq("id", id);
  } catch (err) {
    console.warn("[Credly] Supabase delete failed:", err);
  }

  if (storagePath) {
    await deleteBadgeStorageFile(storagePath);
  }

  // Remove locally
  const currentBadges = getLocalBadges();
  const filtered = currentBadges.filter((b) => b.id !== id);
  setLocalBadges(filtered);
}

/**
 * Toggle the publication status of a badge.
 */
export async function toggleBadgePublish(id: string, is_published: boolean): Promise<CredlyBadge> {
  const currentBadges = getLocalBadges();
  const existing = currentBadges.find((b) => b.id === id);

  try {
    const { data, error } = await supabase
      .from("credly_badges")
      .update({ is_published })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      const updatedList = currentBadges.map((b) => (b.id === id ? data : b));
      setLocalBadges(updatedList);
      return data;
    }
  } catch (err) {
    console.warn("[Credly] Supabase toggle publish failed, saving locally:", err);
  }

  const updated: CredlyBadge = existing
    ? { ...existing, is_published, updated_at: new Date().toISOString() }
    : {
        id,
        name: "Badge",
        issuer: "Issuer",
        description: null,
        badge_image_url: "",
        badge_storage_path: null,
        credly_url: "",
        issue_date: new Date().toISOString().split("T")[0],
        expiry_date: null,
        skills: [],
        is_published,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

  const updatedList = currentBadges.map((b) => (b.id === id ? updated : b));
  setLocalBadges(updatedList);
  return updated;
}

/**
 * Batch update display order of badges.
 */
export async function updateBadgesOrder(
  orderedItems: { id: string; display_order: number }[],
): Promise<void> {
  try {
    const promises = orderedItems.map((item) =>
      supabase
        .from("credly_badges")
        .update({ display_order: item.display_order })
        .eq("id", item.id),
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Credly] Supabase order update failed, saving locally:", err);
  }

  // Reorder locally
  const currentBadges = getLocalBadges();
  const orderMap = new Map(orderedItems.map((i) => [i.id, i.display_order]));
  const updatedList = currentBadges.map((b) => {
    if (orderMap.has(b.id)) {
      return { ...b, display_order: orderMap.get(b.id)! };
    }
    return b;
  });
  updatedList.sort((a, b) => a.display_order - b.display_order);
  setLocalBadges(updatedList);
}
