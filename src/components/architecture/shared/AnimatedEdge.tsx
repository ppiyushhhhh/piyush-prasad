import { useId } from "react";
import type { UnifiedEdge } from "./layout";

export const CATEGORY_EDGE_COLORS: Record<
  UnifiedEdge["category"],
  { stroke: string; activeStroke: string; text: string; bg: string; packet: string; duration: number }
> = {
  network: { stroke: "#1A4BFF", activeStroke: "#0032D6", text: "#1A4BFF", bg: "#EFF6FF", packet: "#1A4BFF", duration: 2.2 },
  data: { stroke: "#059669", activeStroke: "#047857", text: "#059669", bg: "#ECFDF5", packet: "#10B981", duration: 3.2 },
  security: { stroke: "#D97706", activeStroke: "#B45309", text: "#D97706", bg: "#FFFBEB", packet: "#F59E0B", duration: 2.8 },
  deployment: { stroke: "#7C3AED", activeStroke: "#6D28D9", text: "#7C3AED", bg: "#F5F3FF", packet: "#8B5CF6", duration: 3.6 },
  telemetry: { stroke: "#EA580C", activeStroke: "#C2410C", text: "#EA580C", bg: "#FFF7ED", packet: "#F97316", duration: 4.5 },
};

interface AnimatedEdgeProps {
  edge: UnifiedEdge;
  shouldAnimate: boolean;
  isFocused?: boolean;
  isDimmed?: boolean;
  isJourneyActive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onHover?: (id: string | null) => void;
}

export function AnimatedEdge({
  edge,
  shouldAnimate,
  isFocused = false,
  isDimmed = false,
  isJourneyActive = false,
  isSelected = false,
  onClick,
  onHover,
}: AnimatedEdgeProps) {
  const edgeId = useId().replace(/:/g, "_");
  const pathId = `path-${edge.id}-${edgeId}`;
  const colors = CATEGORY_EDGE_COLORS[edge.category] || CATEGORY_EDGE_COLORS.network;

  const isHighlighted = isFocused || isJourneyActive || isSelected;
  const markerId = isHighlighted
    ? `arrow-${edge.category}-active`
    : `arrow-${edge.category}`;

  const isBidirectional = edge.direction === "bidirectional";
  const isSecondary = Boolean(edge.secondary || edge.category === "telemetry");

  // Base animation duration scaled if highlighted
  const duration = isHighlighted ? colors.duration * 0.75 : colors.duration;

  // Primary label & secondary port/protocol
  const primaryText = edge.label || edge.protocol;

  // Static dashed line has opacity at least 0.7
  const strokeOpacity = isDimmed ? 0.2 : isHighlighted ? 1.0 : isSecondary ? 0.7 : 0.85;
  const strokeColor = isHighlighted ? colors.activeStroke : isSecondary ? "#9CA3AF" : colors.stroke;

  // Badge label: primary gets number (1, 2, 3..), secondary gets letter (A, B, C..)
  const badgeLabel = !isSecondary && edge.badgeIndex !== undefined
    ? String(edge.badgeIndex)
    : isSecondary && edge.badgeLetter
      ? edge.badgeLetter
      : null;

  return (
    <g
      className={`transition-opacity duration-300 cursor-pointer ${
        isDimmed ? "opacity-25" : "opacity-100"
      }`}
      onClick={onClick}
      onMouseEnter={() => onHover?.(edge.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <title>{edge.description || `${badgeLabel ? `#${badgeLabel}: ` : ""}${primaryText || "Flow"}`}</title>

      {/* Path reference for animateMotion */}
      <defs>
        <path id={pathId} d={edge.pathData} fill="none" />
      </defs>

      {/* 1. Fully transparent wide path (stroke-width 14) only as hover/click target */}
      <path
        d={edge.pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-auto"
      />

      {/* 2. Exactly ONE visible stroke per connection */}
      <path
        d={edge.pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeOpacity={strokeOpacity}
        strokeDasharray={isSecondary ? "4 4" : "6 4"}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${markerId})`}
        markerStart={isBidirectional ? `url(#${markerId})` : undefined}
        style={
          shouldAnimate && !isSecondary
            ? {
                animation: `edgeFlow ${duration}s linear infinite`,
              }
            : undefined
        }
      />

      {/* 3. Journey Active Beacon */}
      {isJourneyActive && shouldAnimate && (
        <circle
          r="4"
          fill={colors.activeStroke}
          className="drop-shadow-xs"
        >
          <animateMotion
            href={`#${pathId}`}
            dur={`${duration * 0.75}s`}
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      )}

      {/* 4. Numbered / Lettered Badge: 20px circle, 11px bold, 1.5px border */}
      {badgeLabel && (
        <g
          transform={`translate(${edge.midX}, ${edge.midY})`}
          className="pointer-events-auto select-none transition-transform duration-200 hover:scale-110 edge-badge"
        >
          <title>{edge.description || `${badgeLabel}: ${primaryText}`}</title>
          <circle
            r="10"
            fill={isSecondary ? "#F3F4F6" : "#FFFFFF"}
            className={isSecondary ? "fill-stone-100 dark:fill-neutral-800" : "fill-white dark:fill-[#121316]"}
            stroke={isSecondary ? "#9CA3AF" : (isHighlighted ? colors.activeStroke : colors.stroke)}
            strokeWidth="1.5"
            filter="drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12))"
          />
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono, monospace)"
            fill={isSecondary ? "#6B7280" : (isHighlighted ? colors.activeStroke : colors.text)}
          >
            {badgeLabel}
          </text>
        </g>
      )}
    </g>
  );
}
