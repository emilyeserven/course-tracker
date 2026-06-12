import type { PositionedBlip } from "@/components/radar/radarLayout";
import type { RadarBlip, RadarQuadrant } from "@emstack/types";
import type { ReactNode } from "react";

import { RadarBlipDot } from "@/components/radar/RadarBlipDot";
import { QUADRANT_PALETTE } from "@/components/radar/radarLayout";

interface RadarBlipDotLayerProps {
  positioned: PositionedBlip[];
  sortedQuadrants: RadarQuadrant[];
  activeBlipId: string | null;
  selectedBlipId: string | null;
  /** Prefix for React keys so the same blip can appear in multiple layers. */
  keyPrefix?: string;
  dotRadius: number;
  haloRadius: number;
  fontSize: number;
  /** Clamp a missing quadrant index to 0 (used by the adopted layer). */
  clampQuadrantIndex?: boolean;
  /** Build the tooltip subtitle from the resolved quadrant for each blip. */
  renderSubtitle: (quadrantName: string | undefined, blip: RadarBlip) => ReactNode;
  onHover: (id: string | null) => void;
  onClick: (blip: RadarBlip) => void;
}

/**
 * Renders a set of positioned blips as dots, sorted so the active blip paints
 * last. Shared by the main, adopted, and ignored chart layers.
 */
export function RadarBlipDotLayer({
  positioned,
  sortedQuadrants,
  activeBlipId,
  selectedBlipId,
  keyPrefix = "",
  dotRadius,
  haloRadius,
  fontSize,
  clampQuadrantIndex = false,
  renderSubtitle,
  onHover,
  onClick,
}: RadarBlipDotLayerProps) {
  return (
    <>
      {[...positioned]
        .sort((a, b) => {
          const aActive = activeBlipId === a.blip.id ? 1 : 0;
          const bActive = activeBlipId === b.blip.id ? 1 : 0;
          return aActive - bActive;
        })
        .map(({
          blip, x, y, index,
        }) => {
          const quadrantIndex = sortedQuadrants.findIndex(
            q => q.id === blip.quadrantId,
          );
          const paletteIndex = clampQuadrantIndex
            ? Math.max(0, quadrantIndex)
            : quadrantIndex;
          const color = QUADRANT_PALETTE[paletteIndex % QUADRANT_PALETTE.length];
          return (
            <RadarBlipDot
              key={`${keyPrefix}${blip.id}`}
              blip={blip}
              x={x}
              y={y}
              index={index}
              color={color}
              dotRadius={dotRadius}
              haloRadius={haloRadius}
              fontSize={fontSize}
              subtitle={renderSubtitle(sortedQuadrants[quadrantIndex]?.name, blip)}
              isActive={activeBlipId === blip.id}
              isSelected={selectedBlipId === blip.id}
              onHover={onHover}
              onClick={onClick}
            />
          );
        })}
    </>
  );
}
