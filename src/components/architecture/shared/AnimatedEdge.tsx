import { useId } from "react";
import type { UnifiedEdge } from "./layout";
import { CATEGORY_EDGE_COLORS } from "./edge-colors";

export { CATEGORY_EDGE_COLORS };

interface AnimatedEdgeProps {
  edge: UnifiedEdge;
  shouldAnimate: boolean;
  isFocused?: boolean;
  isDimmed?: boolean;
  isJourneyActive?: boolean;
  isSelected?: boolean;
  renderBadge?: boolean;
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
  renderBadge = true,
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

  const duration = isHighlighted ? colors.duration * 0.75 : colors.duration;
  const primaryText = edge.label || edge.protocol;

  const strokeOpacity = isDimmed ? 0.2 : isHighlighted ? 1.0 : isSecondary ? 0.7 : 0.85;
  const strokeColor = isHighlighted ? colors.activeStroke : isSecondary ? "#9CA3AF" : colors.stroke;

  return (
    <g
      className={`transition-opacity duration-300 cursor-pointer ${
        isDimmed ? "opacity-25" : "opacity-100"
      }`}
      onClick={onClick}
      onMouseEnter={() => onHover?.(edge.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <title>{edge.description || `${primaryText || "Flow"}`}</title>

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
        data-edge-id={edge.id}
        data-source={edge.source}
        data-target={edge.target}
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
        <circle r="4" fill={colors.activeStroke} className="drop-shadow-xs">
          <animateMotion
            href={`#${pathId}`}
            dur={`${duration * 0.75}s`}
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      )}

      {/* 4. Numbered / Lettered Badge (if rendered inline) */}
      {renderBadge && (
        <EdgeBadge
          edge={edge}
          isHighlighted={isHighlighted}
          isSecondary={isSecondary}
          isDimmed={isDimmed}
          onHover={onHover}
          onClick={onClick}
        />
      )}
    </g>
  );
}

export interface EdgeBadgeProps {
  edge: UnifiedEdge;
  isHighlighted?: boolean;
  isSecondary?: boolean;
  isDimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: () => void;
}

export function EdgeBadge({
  edge,
  isHighlighted = false,
  isSecondary: propIsSecondary,
  isDimmed = false,
  onHover,
  onClick,
}: EdgeBadgeProps) {
  const isSecondary = propIsSecondary ?? Boolean(edge.secondary || edge.category === "telemetry");
  const colors = CATEGORY_EDGE_COLORS[edge.category] || CATEGORY_EDGE_COLORS.network;
  const primaryText = edge.label || edge.protocol;

  const badgeLabel = !isSecondary && edge.badgeIndex !== undefined
    ? String(edge.badgeIndex)
    : isSecondary && edge.badgeLetter
      ? edge.badgeLetter
      : null;

  if (!badgeLabel) return null;

  return (
    <g
      data-edge-id={edge.id}
      data-source={edge.source}
      data-target={edge.target}
      transform={`translate(${edge.midX}, ${edge.midY})`}
      className={`pointer-events-auto select-none transition-transform duration-200 hover:scale-110 edge-badge cursor-pointer ${
        isDimmed ? "opacity-25" : "opacity-100"
      }`}
      onClick={onClick}
      onMouseEnter={() => onHover?.(edge.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <title>{edge.description || `${badgeLabel}: ${primaryText}`}</title>
      <circle
        r="10"
        fill={isSecondary ? "#F3F4F6" : "#FFFFFF"}
        className={isSecondary ? "fill-stone-100 dark:fill-neutral-800" : "fill-white dark:fill-[#121316]"}
        stroke={isSecondary ? "#9CA3AF" : isHighlighted ? colors.activeStroke : colors.stroke}
        strokeWidth="1.5"
      />
      <text
        y="3.5"
        textAnchor="middle"
        className="mono font-bold select-none pointer-events-none"
        fill={isSecondary ? "#6B7280" : isHighlighted ? colors.activeStroke : colors.stroke}
        fontSize="11"
      >
        {badgeLabel}
      </text>
    </g>
  );
}
