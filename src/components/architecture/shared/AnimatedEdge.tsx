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
}

export function AnimatedEdge({
  edge,
  shouldAnimate,
  isFocused = false,
  isDimmed = false,
  isJourneyActive = false,
  isSelected = false,
  onClick,
}: AnimatedEdgeProps) {
  const edgeId = useId().replace(/:/g, "_");
  const pathId = `path-${edge.id}-${edgeId}`;
  const parallelPathId = `path-parallel-${edge.id}-${edgeId}`;
  const colors = CATEGORY_EDGE_COLORS[edge.category] || CATEGORY_EDGE_COLORS.network;

  const isHighlighted = isFocused || isJourneyActive || isSelected;
  const markerId = isHighlighted
    ? `arrow-${edge.category}-active`
    : `arrow-${edge.category}`;

  const isBidirectional = edge.direction === "bidirectional";

  // Base animation duration scaled if highlighted
  const duration = isHighlighted ? colors.duration * 0.75 : colors.duration;

  // Primary label & secondary port/protocol
  const primaryText = edge.label || edge.protocol;
  const secondaryText = edge.label && edge.protocol && edge.label !== edge.protocol ? edge.protocol : null;
  const hasLabel = Boolean(primaryText);

  // Determine pill dimensions
  const pillWidth = primaryText ? Math.max(primaryText.length * 8 + 24, 60) : 0;
  const pillHeight = 24;

  // Edge stroke properties: minimum 0.6 opacity at rest, 2px stroke
  const strokeOpacity = isDimmed ? 0.2 : isHighlighted ? 1.0 : 0.75;
  const strokeWidth = isHighlighted ? "2.5" : "2";

  return (
    <g
      className={`transition-opacity duration-300 cursor-pointer ${
        isDimmed ? "opacity-25" : "opacity-100"
      }`}
      onClick={onClick}
    >
      {/* Hidden Path Definition for AnimateMotion referencing */}
      <defs>
        <path id={pathId} d={edge.pathData} fill="none" />
        {isBidirectional && edge.parallelPathData && (
          <path id={parallelPathId} d={edge.parallelPathData} fill="none" />
        )}
      </defs>

      {/* 1. Underlying static solid path (Always clearly visible at rest: 2px stroke, >= 0.6 opacity) */}
      <path
        d={edge.pathData}
        fill="none"
        stroke={isHighlighted ? colors.activeStroke : colors.stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${markerId})`}
      />

      {/* 2. Soft outer glow when highlighted or active in journey */}
      {isHighlighted && (
        <path
          d={edge.pathData}
          fill="none"
          stroke={colors.activeStroke}
          strokeWidth="6"
          strokeOpacity="0.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* 3. Flowing dashed stroke forward for live telemetry/data visualization */}
      {shouldAnimate && (
        <path
          d={edge.pathData}
          fill="none"
          stroke={isHighlighted ? colors.activeStroke : colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray="6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: `edgeFlow ${duration}s linear infinite`,
          }}
        />
      )}

      {/* 4. Bidirectional edge: second parallel line 6px apart */}
      {isBidirectional && (
        <>
          <path
            d={edge.parallelPathData || edge.pathData}
            fill="none"
            stroke={isHighlighted ? colors.activeStroke : colors.stroke}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerStart={`url(#${markerId})`}
          />
          {shouldAnimate && (
            <path
              d={edge.parallelPathData || edge.pathData}
              fill="none"
              stroke={isHighlighted ? colors.activeStroke : colors.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray="6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: `edgeFlowReverse ${duration * 1.2}s linear infinite`,
              }}
            />
          )}
        </>
      )}

      {/* 5. Journey Active Signal Beacon */}
      {isJourneyActive && shouldAnimate && (
        <circle
          r="4.5"
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

      {/* 6. Numbered Badge (for > 8 edges) or Centered Label Pill (>= 11px font) */}
      {edge.badgeIndex !== undefined ? (
        <g
          transform={`translate(${edge.midX}, ${edge.midY})`}
          className="pointer-events-auto select-none transition-transform duration-200 hover:scale-110 edge-badge"
        >
          <title>{edge.description || `${edge.badgeIndex}: ${primaryText}`}</title>
          <circle
            r="11"
            fill="#FFFFFF"
            className="dark:fill-[#121316]"
            stroke={isHighlighted ? colors.activeStroke : colors.stroke}
            strokeWidth={isHighlighted ? "2.2" : "1.8"}
            filter="drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12))"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono, monospace)"
            fill={isHighlighted ? colors.activeStroke : colors.text}
          >
            {edge.badgeIndex}
          </text>
        </g>
      ) : hasLabel ? (
        <g
          transform={`translate(${edge.midX}, ${edge.midY})`}
          className="pointer-events-auto select-none transition-transform duration-200 hover:scale-105 edge-label"
        >
          <title>{edge.description || `${primaryText}${secondaryText ? ` (${secondaryText})` : ""}`}</title>
          {/* Solid background pill */}
          <rect
            x={-pillWidth / 2}
            y={-pillHeight / 2}
            width={pillWidth}
            height={pillHeight}
            rx={pillHeight / 2}
            fill="#FFFFFF"
            className="dark:fill-[#121316]"
            stroke={isHighlighted ? colors.activeStroke : colors.stroke}
            strokeWidth={isHighlighted ? "1.8" : "1.2"}
            strokeOpacity={isHighlighted ? 0.9 : 0.6}
            filter="drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))"
          />

          {/* Label Text: minimum 11px font */}
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-mono, monospace)"
            fill={isHighlighted ? colors.activeStroke : colors.text}
            className="transition-colors duration-150"
          >
            {primaryText}
          </text>
        </g>
      ) : null}
    </g>
  );
}
