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

  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && file.type !== "") {
    return {
      valid: false,
      error: `Disallowed MIME type "${file.type}". Please upload an image file.`,
    };
  }

  if (ext === "svg" || file.type === "image/svg+xml") {
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
 * Upload badge image to Supabase Storage bucket 'credly-badges'.
 */
export async function uploadBadgeImage(file: File): Promise<{ url: string; storagePath: string }> {
  const validation = await validateBadgeFile(file);
  if (!validation.valid || !validation.sanitizedFile) {
    throw new Error(validation.error || "Invalid file for badge upload");
  }

  const uploadFile = validation.sanitizedFile;
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

  const { error: uploadError } = await supabase.storage
    .from(CREDLY_STORAGE_BUCKET)
    .upload(storagePath, uploadFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: uploadFile.type || "image/png",
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(CREDLY_STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Failed to retrieve public URL for uploaded badge.");
  }

  return {
    url: publicUrlData.publicUrl,
    storagePath,
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

/**
 * Fetch published badges for the public portfolio.
 * Gracefully falls back to fallback badges if request fails.
 */
export async function fetchPublishedBadges(): Promise<CredlyBadge[]> {
  try {
    const { data, error } = await supabase
      .from("credly_badges")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Credly] Supabase query failed, using static fallback:", error.message);
      return FALLBACK_CREDLY_BADGES;
    }

    if (!data || data.length === 0) {
      return FALLBACK_CREDLY_BADGES;
    }

    return data;
  } catch (err) {
    console.warn("[Credly] Network error, using static fallback:", err);
    return FALLBACK_CREDLY_BADGES;
  }
}

/**
 * Fetch all badges (published and drafts) for admin dashboard.
 */
export async function fetchAllBadges(): Promise<CredlyBadge[]> {
  const { data, error } = await supabase
    .from("credly_badges")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/**
 * Create a new badge record.
 */
export async function createBadge(input: CredlyBadgeInput): Promise<CredlyBadge> {
  // Determine next display order if not provided
  let order = input.display_order ?? 0;
  if (order === 0) {
    const { data: countData } = await supabase
      .from("credly_badges")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    if (countData && countData.length > 0) {
      order = (countData[0].display_order ?? 0) + 1;
    } else {
      order = 1;
    }
  }

  const insertData: CredlyBadgeInsert = {
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
  };

  const { data, error } = await supabase.from("credly_badges").insert(insertData).select().single();

  if (error) {
    // If insert failed and we uploaded a new storage file, cleanup to avoid orphaned storage
    if (input.badge_storage_path) {
      await deleteBadgeStorageFile(input.badge_storage_path);
    }
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update an existing badge. If the image was replaced, deletes the previous storage file.
 */
export async function updateBadge(
  id: string,
  input: Partial<CredlyBadgeInput>,
  previousStoragePath?: string | null,
): Promise<CredlyBadge> {
  const updateData: CredlyBadgeUpdate = {};

  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.issuer !== undefined) updateData.issuer = input.issuer.trim();
  if (input.description !== undefined) updateData.description = input.description?.trim() || null;
  if (input.badge_image_url !== undefined)
    updateData.badge_image_url = input.badge_image_url.trim();
  if (input.badge_storage_path !== undefined)
    updateData.badge_storage_path = input.badge_storage_path;
  if (input.credly_url !== undefined) updateData.credly_url = input.credly_url.trim();
  if (input.issue_date !== undefined) updateData.issue_date = input.issue_date;
  if (input.expiry_date !== undefined) updateData.expiry_date = input.expiry_date || null;
  if (input.skills !== undefined) updateData.skills = input.skills;
  if (input.is_published !== undefined) updateData.is_published = input.is_published;
  if (input.display_order !== undefined) updateData.display_order = input.display_order;

  const { data, error } = await supabase
    .from("credly_badges")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // If a new storage path was set and is different from previous, delete the previous file
  if (
    input.badge_storage_path &&
    previousStoragePath &&
    input.badge_storage_path !== previousStoragePath
  ) {
    await deleteBadgeStorageFile(previousStoragePath);
  }

  return data;
}

/**
 * Delete a badge and its associated storage file.
 */
export async function deleteBadge(id: string, storagePath?: string | null): Promise<void> {
  const { error } = await supabase.from("credly_badges").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  if (storagePath) {
    await deleteBadgeStorageFile(storagePath);
  }
}

/**
 * Toggle the publication status of a badge.
 */
export async function toggleBadgePublish(id: string, is_published: boolean): Promise<CredlyBadge> {
  const { data, error } = await supabase
    .from("credly_badges")
    .update({ is_published })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Batch update display order of badges.
 */
export async function updateBadgesOrder(
  orderedItems: { id: string; display_order: number }[],
): Promise<void> {
  // Update each badge's display_order
  const promises = orderedItems.map((item) =>
    supabase.from("credly_badges").update({ display_order: item.display_order }).eq("id", item.id),
  );

  const results = await Promise.all(promises);
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    throw new Error(failed.error.message);
  }
}
