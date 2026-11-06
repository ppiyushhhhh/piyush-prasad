import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import {
  getKnowledgeStatus,
  invalidateKnowledgeCache,
  type KnowledgeStatusTelemetry,
} from "./portfolio-knowledge.server";

/**
 * Returns a Supabase service-role admin client if configured, or null.
 */
function getAdminClient() {
  const url = process.env["SUPABASE_URL"];
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !serviceKey) return null;

  return createClient<Database>(url, serviceKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Authenticates the caller using their Supabase JWT bearer token via getRequest().
 */
async function authenticateCaller() {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Bearer token is required.");
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    throw new Error("Unauthorized: Bearer token is empty.");
  }

  const url = process.env["SUPABASE_URL"];
  const pubKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !pubKey) {
    throw new Error("Missing Supabase configuration in server environment.");
  }

  const userClient = createClient<Database>(url, pubKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(token);

  if (userError || !user) {
    throw new Error("Unauthorized: Invalid or expired session. Please sign in again.");
  }

  return { user, userClient, token };
}

/**
 * Enforces admin authorization.
 * Checks whether user has 'admin' in user_roles.
 * If zero admins exist in user_roles (bootstrap), claims first user as admin.
 */
async function verifyAdminCaller() {
  const { user, userClient, token } = await authenticateCaller();
  const adminClient = getAdminClient();
  const db = adminClient ?? userClient;

  // Check user role
  const { data: roleRow, error: roleError } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError && roleError.code !== "PGRST116") {
    console.error("[ai-knowledge] Role verification query failed:", roleError.message);
  }

  const isAdmin = roleRow?.role === "admin";

  if (!isAdmin) {
    // Check if ANY admin exists in user_roles
    let count: number | null = null;
    let countError: unknown = null;
    try {
      const res = await db
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      count = res.count;
      countError = res.error;
    } catch (e: unknown) {
      countError = e;
    }

    if (!countError && (count === 0 || count === null)) {
      console.log(
        `[ai-knowledge] Bootstrap: Claiming admin role for first user ${user.email} (${user.id})`,
      );
      try {
        await db.from("user_roles").insert({
          user_id: user.id,
          role: "admin",
        });
      } catch (insertError: unknown) {
        const msg = insertError instanceof Error ? insertError.message : String(insertError);
        console.warn("[ai-knowledge] Bootstrap role insert warning:", msg);
      }
      return { user, db, token };
    }

    throw new Error("Forbidden: Administrator privileges required.");
  }

  return { user, db, token };
}

/**
 * Logs an administrative mutation in public.admin_audit_log.
 */
async function logAuditEntry(params: {
  adminUserId: string;
  adminEmail: string;
  action: string;
  targetRecordId?: string;
  details?: Json;
}) {
  try {
    const adminClient = getAdminClient();
    if (!adminClient) return;
    await adminClient.from("admin_audit_log").insert({
      admin_user_id: params.adminUserId,
      admin_email: params.adminEmail,
      action: params.action,
      target_table: "portfolio_custom_knowledge",
      target_record_id: params.targetRecordId,
      details: params.details ?? {},
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[ai-knowledge] Failed to write audit log:", err);
  }
}

/**
 * Returns dynamic knowledge indexing status and telemetry for the admin dashboard.
 * Requires administrator authentication.
 */
export const getAiKnowledgeTelemetry = createServerFn({ method: "GET" }).handler(
  async (): Promise<KnowledgeStatusTelemetry> => {
    await verifyAdminCaller();
    return await getKnowledgeStatus();
  },
);

/**
 * Forces cache invalidation and a real-time re-sync from Supabase.
 * Requires administrator authentication.
 */
export const refreshAiKnowledge = createServerFn({ method: "POST" }).handler(
  async (): Promise<KnowledgeStatusTelemetry> => {
    const { user } = await verifyAdminCaller();

    // Log to audit log so other instances observe the timestamp update via fingerprint
    await logAuditEntry({
      adminUserId: user.id,
      adminEmail: user.email ?? "admin",
      action: "AI_KNOWLEDGE_FORCE_SYNC",
      details: { triggered_at: new Date().toISOString() },
    });

    invalidateKnowledgeCache();
    return await getKnowledgeStatus();
  },
);

/**
 * Server function to invalidate knowledge cache after successful Credly badge mutations.
 * Requires administrator authentication.
 */
export const invalidateAiKnowledgeCacheServerFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    const { user } = await verifyAdminCaller();

    await logAuditEntry({
      adminUserId: user.id,
      adminEmail: user.email ?? "admin",
      action: "AI_KNOWLEDGE_CREDLY_MUTATION_SYNC",
    });

    invalidateKnowledgeCache();
    return { success: true };
  },
);

export interface AdminCustomKnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Retrieves all custom portfolio knowledge facts / FAQs for admin dashboard.
 * Requires administrator authentication.
 */
export const getAdminCustomKnowledge = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCustomKnowledgeItem[]> => {
    const { db } = await verifyAdminCaller();

    const { data, error } = await db
      .from("portfolio_custom_knowledge")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ai-knowledge] Query error in getAdminCustomKnowledge:", error.message);
      throw new Error(`Failed to retrieve custom knowledge: ${error.message}`);
    }
    return (data ?? []) as AdminCustomKnowledgeItem[];
  },
);

export interface SaveCustomKnowledgeInput {
  id?: string;
  category: string;
  title: string;
  content: string;
  is_published?: boolean;
  display_order?: number;
}

/**
 * Creates or updates a custom knowledge / FAQ entry.
 * Requires administrator authentication.
 * Cache invalidation occurs ONLY after successful database mutation.
 */
export const saveAdminCustomKnowledge = createServerFn({ method: "POST" })
  .validator((data: SaveCustomKnowledgeInput) => data)
  .handler(async ({ data }): Promise<{ success: boolean; id: string }> => {
    const { user, db } = await verifyAdminCaller();

    if (data.id) {
      // Update existing record
      const { error } = await db
        .from("portfolio_custom_knowledge")
        .update({
          category: data.category.trim(),
          title: data.title.trim(),
          content: data.content.trim(),
          is_published: data.is_published ?? true,
          display_order: data.display_order ?? 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (error) {
        console.error("[ai-knowledge] Database update failed:", error.message);
        throw new Error(error.message);
      }

      // Invalidate cache ONLY after successful mutation
      invalidateKnowledgeCache();

      await logAuditEntry({
        adminUserId: user.id,
        adminEmail: user.email ?? "admin",
        action: "AI_KNOWLEDGE_UPDATE_FACT",
        targetRecordId: data.id,
        details: { category: data.category, title: data.title },
      });

      return { success: true, id: data.id };
    }

    // Insert new record
    const { data: inserted, error } = await db
      .from("portfolio_custom_knowledge")
      .insert({
        category: data.category.trim(),
        title: data.title.trim(),
        content: data.content.trim(),
        is_published: data.is_published ?? true,
        display_order: data.display_order ?? 0,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[ai-knowledge] Database insert failed:", error?.message);
      throw new Error(error?.message ?? "Insert failed");
    }

    // Invalidate cache ONLY after successful mutation
    invalidateKnowledgeCache();

    await logAuditEntry({
      adminUserId: user.id,
      adminEmail: user.email ?? "admin",
      action: "AI_KNOWLEDGE_CREATE_FACT",
      targetRecordId: inserted.id,
      details: { category: data.category, title: data.title },
    });

    return { success: true, id: inserted.id };
  });

/**
 * Deletes a custom knowledge entry.
 * Requires administrator authentication.
 * Cache invalidation occurs ONLY after successful database deletion.
 */
export const deleteAdminCustomKnowledge = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<{ success: boolean }> => {
    const { user, db } = await verifyAdminCaller();

    const { error } = await db.from("portfolio_custom_knowledge").delete().eq("id", id);

    if (error) {
      console.error("[ai-knowledge] Database delete failed:", error.message);
      throw new Error(error.message);
    }

    // Invalidate cache ONLY after successful deletion
    invalidateKnowledgeCache();

    await logAuditEntry({
      adminUserId: user.id,
      adminEmail: user.email ?? "admin",
      action: "AI_KNOWLEDGE_DELETE_FACT",
      targetRecordId: id,
    });

    return { success: true };
  });

/**
 * Toggles publish state for a custom knowledge item.
 * Requires administrator authentication.
 * Cache invalidation occurs ONLY after successful database mutation.
 */
export const toggleCustomKnowledgePublish = createServerFn({ method: "POST" })
  .validator((data: { id: string; is_published: boolean }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const { user, db } = await verifyAdminCaller();

    const { error } = await db
      .from("portfolio_custom_knowledge")
      .update({
        is_published: data.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) {
      console.error("[ai-knowledge] Database toggle publish failed:", error.message);
      throw new Error(error.message);
    }

    // Invalidate cache ONLY after successful mutation
    invalidateKnowledgeCache();

    await logAuditEntry({
      adminUserId: user.id,
      adminEmail: user.email ?? "admin",
      action: "AI_KNOWLEDGE_TOGGLE_PUBLISH",
      targetRecordId: data.id,
      details: { is_published: data.is_published },
    });

    return { success: true };
  });
