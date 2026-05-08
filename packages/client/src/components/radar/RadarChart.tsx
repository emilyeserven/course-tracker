import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types/src";

import { useMemo, useState } from "react";

interface RadarChartProps {
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  blips: RadarBlip[];
  size?: number;
  onBlipClick?: (blip: RadarBlip) => void;
}

interface PositionedBlip {
  blip: RadarBlip;
  x: number;
  y: number;
  index: number;
}

const QUADRANT_PALETTE = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#db2777",
];

// Deterministic pseudo-random in [0, 1) from a string. Used to keep blip
// placements stable across renders without storing coordinates in the DB.
function hashUnit(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export function RadarChart({
  quadrants,
  rings,
  blips,
  size = 600,
  onBlipClick,
}: RadarChartProps) {
  const [hoveredBlipId, setHoveredBlipId] = useState<string | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 24;

  const sortedQuadrants = useMemo(
    () => [...quadrants].sort((a, b) => a.position - b.position),
    [quadrants],
  );
  const sortedRings = useMemo(
    () => [...rings].sort((a, b) => a.position - b.position),
    [rings],
  );

  const quadrantCount = sortedQuadrants.length;
  const ringCount = sortedRings.length;

  const ringRadii = useMemo(() => {
    if (ringCount === 0) {
      return [];
    }
    return sortedRings.map((_ring, idx) => ((idx + 1) / ringCount) * maxRadius);
  }, [sortedRings, ringCount, maxRadius]);

  const positionedBlips = useMemo<PositionedBlip[]>(() => {
    if (quadrantCount === 0 || ringCount === 0) {
      return [];
    }
    const angleStep = (Math.PI * 2) / quadrantCount;
    let displayIndex = 0;
    return blips
      .map((blip) => {
        const quadrantIndex = sortedQuadrants.findIndex(
          q => q.id === blip.quadrantId,
        );
        const ringIndex = sortedRings.findIndex(r => r.id === blip.ringId);
        if (quadrantIndex < 0 || ringIndex < 0) {
          return null;
        }
        const innerR = ringIndex === 0 ? 0 : ringRadii[ringIndex - 1];
        const outerR = ringRadii[ringIndex];
        const startAngle = -Math.PI / 2 + quadrantIndex * angleStep;
        // Pad away from boundaries so blips don't visually escape their cell.
        const angleSeed = hashUnit(`${blip.id}:angle`);
        const radiusSeed = hashUnit(`${blip.id}:radius`);
        const angleOffset = (0.1 + angleSeed * 0.8) * angleStep;
        const radius = innerR + (0.15 + radiusSeed * 0.7) * (outerR - innerR);
        const angle = startAngle + angleOffset;
        displayIndex += 1;
        return {
          blip,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
          index: displayIndex,
        };
      })
      .filter((b): b is PositionedBlip => b !== null);
  }, [
    blips,
    sortedQuadrants,
    sortedRings,
    ringRadii,
    quadrantCount,
    ringCount,
    cx,
    cy,
  ]);

  if (quadrantCount === 0 || ringCount === 0) {
    return (
      <div
        className={`
          flex items-center justify-center rounded-sm border border-dashed p-8
          text-muted-foreground
        `}
        style={{
          minHeight: size / 2,
        }}
      >
        Configure at least one quadrant and one ring to display the radar.
      </div>
    );
  }

  const angleStep = (Math.PI * 2) / quadrantCount;

  return (
    <div className="flex flex-col gap-4">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        style={{
          maxWidth: size,
        }}
        role="img"
        aria-label="Radar chart"
      >
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
          // Place ring labels along the top of each ring, slightly above the
          // arc so they sit just outside the ring boundary going inward.
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
          // Quadrant label sits along the bisecting angle just outside the
          // outermost ring.
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
        {positionedBlips.map(({
          blip, x, y, index,
        }) => {
          const quadrantIndex = sortedQuadrants.findIndex(
            q => q.id === blip.quadrantId,
          );
          const color
            = QUADRANT_PALETTE[quadrantIndex % QUADRANT_PALETTE.length];
          const isHovered = hoveredBlipId === blip.id;
          return (
            <g
              key={blip.id}
              onMouseEnter={() => setHoveredBlipId(blip.id)}
              onMouseLeave={() => setHoveredBlipId(null)}
              onClick={() => onBlipClick?.(blip)}
              style={{
                cursor: onBlipClick ? "pointer" : "default",
              }}
            >
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 12 : 10}
                fill={color}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight="700"
                fill="white"
                style={{
                  pointerEvents: "none",
                }}
              >
                {index}
              </text>
            </g>
          );
        })}
      </svg>
      <RadarLegend
        quadrants={sortedQuadrants}
        positionedBlips={positionedBlips}
        rings={sortedRings}
        onHover={setHoveredBlipId}
        hoveredBlipId={hoveredBlipId}
        onBlipClick={onBlipClick}
      />
    </div>
  );
}

interface RadarLegendProps {
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  positionedBlips: PositionedBlip[];
  hoveredBlipId: string | null;
  onHover: (id: string | null) => void;
  onBlipClick?: (blip: RadarBlip) => void;
}

function RadarLegend({
  quadrants,
  rings,
  positionedBlips,
  hoveredBlipId,
  onHover,
  onBlipClick,
}: RadarLegendProps) {
  const ringNameById = useMemo(() => {
    const map: Record<string, string> = {};
    rings.forEach((r) => {
      map[r.id] = r.name;
    });
    return map;
  }, [rings]);

  return (
    <div
      className={`
        grid grid-cols-1 gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      `}
    >
      {quadrants.map((q, idx) => {
        const color = QUADRANT_PALETTE[idx % QUADRANT_PALETTE.length];
        const items = positionedBlips.filter(
          pb => pb.blip.quadrantId === q.id,
        );
        return (
          <div
            key={q.id}
            className="flex flex-col gap-1"
          >
            <h4
              className="text-sm font-semibold uppercase"
              style={{
                color,
              }}
            >
              {q.name}
            </h4>
            {items.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No blips yet.
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {items.map(({
                blip, index,
              }) => (
                <li
                  key={blip.id}
                  onMouseEnter={() => onHover(blip.id)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onBlipClick?.(blip)}
                  className={`
                    cursor-pointer rounded-sm px-1 py-0.5 text-sm
                    ${hoveredBlipId === blip.id ? "bg-gray-200" : ""}
                  `}
                >
                  <span
                    className="mr-1 inline-block font-mono text-xs"
                    style={{
                      color,
                    }}
                  >
                    {index}.
                  </span>
                  <span className="font-medium">{blip.topicName}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    (
                    {ringNameById[blip.ringId]}
                    )
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
