import { createServerFn } from "@tanstack/react-start";
import {
  getKnowledgeStatus,
  invalidateKnowledgeCache,
  type KnowledgeStatusTelemetry,
  type CustomKnowledgeRow,
} from "./portfolio-knowledge.server";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Returns dynamic knowledge indexing status and telemetry for the admin dashboard.
 */
export const getAiKnowledgeTelemetry = createServerFn({ method: "GET" }).handler(
  async (): Promise<KnowledgeStatusTelemetry> => {
    return await getKnowledgeStatus();
  },
);

/**
 * Forces cache invalidation and a real-time re-sync from Supabase.
 */
export const refreshAiKnowledge = createServerFn({ method: "POST" }).handler(
  async (): Promise<KnowledgeStatusTelemetry> => {
    invalidateKnowledgeCache();
    return await getKnowledgeStatus();
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
 */
export const getAdminCustomKnowledge = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCustomKnowledgeItem[]> => {
    const db = await admin();
    try {
      const { data, error } = await db
        .from("portfolio_custom_knowledge")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[ai-knowledge] Query returned error (table might be migrating):", error.message);
        return [];
      }
      return (data ?? []) as AdminCustomKnowledgeItem[];
    } catch (err) {
      console.warn("[ai-knowledge] Failed to query custom knowledge:", err);
      return [];
    }
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
 */
export const saveAdminCustomKnowledge = createServerFn({ method: "POST" })
  .validator((data: SaveCustomKnowledgeInput) => data)
  .handler(async ({ data }): Promise<{ success: boolean; id: string }> => {
    const db = await admin();
    invalidateKnowledgeCache();

    if (data.id) {
      // Update
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

      if (error) throw new Error(error.message);
      return { success: true, id: data.id };
    }

    // Insert
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

    if (error || !inserted) throw new Error(error?.message ?? "Insert failed");
    return { success: true, id: inserted.id };
  });

/**
 * Deletes a custom knowledge entry.
 */
export const deleteAdminCustomKnowledge = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<{ success: boolean }> => {
    const db = await admin();
    invalidateKnowledgeCache();

    const { error } = await db
      .from("portfolio_custom_knowledge")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

/**
 * Toggles publish state for a custom knowledge item.
 */
export const toggleCustomKnowledgePublish = createServerFn({ method: "POST" })
  .validator((data: { id: string; is_published: boolean }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const db = await admin();
    invalidateKnowledgeCache();

    const { error } = await db
      .from("portfolio_custom_knowledge")
      .update({
        is_published: data.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
