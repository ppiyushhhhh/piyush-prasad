import { CATEGORY_EDGE_COLORS } from "./AnimatedEdge";

export function ArrowheadMarkers() {
  return (
    <defs>
      {/* Category-specific Arrowheads */}
      {Object.entries(CATEGORY_EDGE_COLORS).map(([cat, colors]) => (
        <marker
          key={`arrow-${cat}`}
          id={`arrow-${cat}`}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill={colors.stroke} />
        </marker>
      ))}

      {/* Active / Highlighted Category Arrowheads */}
      {Object.entries(CATEGORY_EDGE_COLORS).map(([cat, colors]) => (
        <marker
          key={`arrow-${cat}-active`}
          id={`arrow-${cat}-active`}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill={colors.activeStroke} />
        </marker>
      ))}
    </defs>
  );
}
