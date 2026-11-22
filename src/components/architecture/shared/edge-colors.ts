import type { UnifiedEdge } from "./layout";

export const CATEGORY_EDGE_COLORS: Record<
  UnifiedEdge["category"],
  { stroke: string; activeStroke: string; text: string; bg: string; packet: string; duration: number }
> = {
  network: { stroke: "#1A4BFF", activeStroke: "#1439CC", text: "#1A4BFF", bg: "#EEF2FF", packet: "#1A4BFF", duration: 2.2 },
  data: { stroke: "#0284C7", activeStroke: "#0369A1", text: "#0284C7", bg: "#E0F2FE", packet: "#0284C7", duration: 3.2 },
  security: { stroke: "#D97706", activeStroke: "#B45309", text: "#D97706", bg: "#FFFBEB", packet: "#F59E0B", duration: 2.8 },
  deployment: { stroke: "#7C3AED", activeStroke: "#6D28D9", text: "#7C3AED", bg: "#F5F3FF", packet: "#8B5CF6", duration: 3.6 },
  telemetry: { stroke: "#64748B", activeStroke: "#475569", text: "#64748B", bg: "#F1F5F9", packet: "#64748B", duration: 4.5 },
};
