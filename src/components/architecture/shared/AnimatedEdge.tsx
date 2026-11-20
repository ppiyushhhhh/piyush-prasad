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
  const colors = CATEGORY_EDGE_COLORS[edge.category] || CATEGORY_EDGE_COLORS.network;

  const isHighlighted = isFocused || isJourneyActive || isSelected;
  const markerId = isHighlighted
    ? `arrow-${edge.category}-active`
    : `arrow-${edge.category}`;

  const isBidirectional = edge.direction === "bidirectional";

  // Base animation duration scaled if highlighted
  const duration = isHighlighted ? colors.duration * 0.75 : colors.duration;

  // Packet count: 2 for short, 3 for active journey
  const packetCount = isJourneyActive ? 3 : 2;
  const packetDelays = [0, duration * 0.5, duration * 0.25];

  // Primary label & secondary port/protocol
  const primaryText = edge.label || edge.protocol || "Traffic Flow";
  const secondaryText = edge.label && edge.protocol && edge.label !== edge.protocol ? edge.protocol : null;

  // Determine pill dimensions
  const pillWidth = Math.max(primaryText.length * 7 + 24, 76);
  const pillHeight = secondaryText ? 26 : 18;

  return (
    <g
      className={`transition-opacity duration-300 cursor-pointer ${
        isDimmed ? "opacity-20" : "opacity-100"
      }`}
      onClick={onClick}
    >
      {/* Hidden Path Definition for AnimateMotion referencing */}
      <defs>
        <path id={pathId} d={edge.pathData} fill="none" />
      </defs>

      {/* 1. Underlying static path (low opacity) */}
      <path
        d={edge.pathData}
        fill="none"
        stroke={isHighlighted ? colors.activeStroke : colors.stroke}
        strokeWidth={isHighlighted ? "2.6" : "1.8"}
        strokeOpacity={isHighlighted ? 0.45 : 0.25}
        strokeLinecap="round"
      />

      {/* 2. Soft outer glow when highlighted or active in journey */}
      {isHighlighted && (
        <path
          d={edge.pathData}
          fill="none"
          stroke={colors.activeStroke}
          strokeWidth="7"
          strokeOpacity="0.22"
          strokeLinecap="round"
        />
      )}

      {/* 3. Flowing dashed stroke forward */}
      <path
        d={edge.pathData}
        fill="none"
        stroke={isHighlighted ? colors.activeStroke : colors.stroke}
        strokeWidth={isHighlighted ? "2.4" : "1.8"}
        strokeDasharray={shouldAnimate ? "7 5" : undefined}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        style={
          shouldAnimate
            ? {
                animation: `edgeFlow ${duration}s linear infinite`,
              }
            : undefined
        }
      />

      {/* 4. If bidirectional, opposite flowing stroke */}
      {isBidirectional && shouldAnimate && (
        <path
          d={edge.pathData}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="1.4"
          strokeDasharray="4 6"
          strokeOpacity="0.8"
          strokeLinecap="round"
          markerStart={`url(#${markerId})`}
          style={{
            animation: `edgeFlowReverse ${duration * 1.2}s linear infinite`,
          }}
        />
      )}

      {/* 5. Moving Packets along the SVG Path */}
      {shouldAnimate &&
        Array.from({ length: packetCount }).map((_, i) => (
          <g key={`packet-${i}`}>
            {edge.category === "data" ? (
              // Data packet: Square
              <rect
                x={isJourneyActive ? "-3.5" : "-2.5"}
                y={isJourneyActive ? "-3.5" : "-2.5"}
                width={isJourneyActive ? "7" : "5"}
                height={isJourneyActive ? "7" : "5"}
                rx="1"
                fill={colors.packet}
                className="drop-shadow-xs"
              >
                <animateMotion
                  href={`#${pathId}`}
                  dur={`${duration}s`}
                  begin={`${packetDelays[i]}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </rect>
            ) : edge.category === "security" ? (
              // Security packet: Diamond
              <polygon
                points={
                  isJourneyActive
                    ? "0,-4.5 4.5,0 0,4.5 -4.5,0"
                    : "0,-3.5 3.5,0 0,3.5 -3.5,0"
                }
                fill={colors.packet}
                className="drop-shadow-xs"
              >
                <animateMotion
                  href={`#${pathId}`}
                  dur={`${duration}s`}
                  begin={`${packetDelays[i]}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </polygon>
            ) : edge.category === "deployment" ? (
              // Deployment packet: Arrow triangle
              <polygon
                points={
                  isJourneyActive
                    ? "-4,-3.5 4.5,0 -4,3.5"
                    : "-3,-2.5 3.5,0 -3,2.5"
                }
                fill={colors.packet}
                className="drop-shadow-xs"
              >
                <animateMotion
                  href={`#${pathId}`}
                  dur={`${duration}s`}
                  begin={`${packetDelays[i]}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </polygon>
            ) : (
              // Network & Telemetry packet: Glowing dot
              <circle
                r={isJourneyActive ? 3.5 : 2.5}
                fill={colors.packet}
                className="drop-shadow-xs"
              >
                <animateMotion
                  href={`#${pathId}`}
                  dur={`${duration}s`}
                  begin={`${packetDelays[i]}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>
            )}
          </g>
        ))}

      {/* 6. Centered Protocol / Port Pill */}
      <g
        transform={`translate(${edge.midX}, ${edge.midY})`}
        className="pointer-events-auto select-none transition-transform duration-200 hover:scale-105"
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
          stroke={isHighlighted ? colors.activeStroke : "#E5E5DF"}
          strokeWidth={isHighlighted ? "1.6" : "1"}
          filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.06))"
        />

        {secondaryText ? (
          <>
            <text
              x="0"
              y="-1"
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fontFamily="var(--font-mono, monospace)"
              fill={isHighlighted ? colors.activeStroke : colors.text}
            >
              {primaryText}
            </text>
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fontFamily="var(--font-mono, monospace)"
              fill="#64748B"
              className="dark:fill-neutral-400"
            >
              {secondaryText}
            </text>
          </>
        ) : (
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            fontFamily="var(--font-mono, monospace)"
            fill={isHighlighted ? colors.activeStroke : colors.text}
          >
            {primaryText}
          </text>
        )}
      </g>
    </g>
  );
}
