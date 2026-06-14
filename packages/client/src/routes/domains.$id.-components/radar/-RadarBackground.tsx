import type { RadarQuadrant, RadarRing } from "@emstack/types";

import { QUADRANT_PALETTE } from "@/components/radar/radarLayout";

interface RadarBackgroundProps {
  cx: number;
  cy: number;
  maxRadius: number;
  angleStep: number;
  ringRadii: number[];
  sortedRings: RadarRing[];
  sortedQuadrants: RadarQuadrant[];
}

/**
 * Static SVG backdrop for the radar: concentric ring circles, the quadrant
 * divider lines, and the ring + quadrant labels. Pure geometry; rendered inside
 * the parent <svg>.
 */
export function RadarBackground({
  cx,
  cy,
  maxRadius,
  angleStep,
  ringRadii,
  sortedRings,
  sortedQuadrants,
}: RadarBackgroundProps) {
  return (
    <>
      {ringRadii.map((r, idx) => (
        <circle
          key={sortedRings[idx].id}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#d1d5db"
          strokeWidth={1}
        />
      ))}
      {sortedQuadrants.map((q, idx) => {
        const angle = -Math.PI / 2 + idx * angleStep;
        const x2 = cx + maxRadius * Math.cos(angle);
        const y2 = cy + maxRadius * Math.sin(angle);
        return (
          <line
            key={q.id}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="#9ca3af"
            strokeWidth={1}
          />
        );
      })}
      {ringRadii.map((r, idx) => {
        const labelY = cy - r + 12;
        return (
          <text
            key={`label-${sortedRings[idx].id}`}
            x={cx}
            y={labelY}
            textAnchor="middle"
            fontSize={11}
            fill="#6b7280"
            fontWeight="500"
          >
            {sortedRings[idx].name}
          </text>
        );
      })}
      {sortedQuadrants.map((q, idx) => {
        const angle = -Math.PI / 2 + (idx + 0.5) * angleStep;
        const labelRadius = maxRadius + 8;
        const x = cx + labelRadius * Math.cos(angle);
        const y = cy + labelRadius * Math.sin(angle);
        return (
          <text
            key={`q-label-${q.id}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight="600"
            fill={QUADRANT_PALETTE[idx % QUADRANT_PALETTE.length]}
          >
            {q.name}
          </text>
        );
      })}
    </>
  );
}
