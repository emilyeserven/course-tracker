import type { PositionedBlip } from "@/components/radar/radarLayout";
import type { RadarBlip, RadarQuadrant } from "@emstack/types";

import { RadarBlipDot } from "@/components/radar/RadarBlipDot";
import { RadarBlipDotLayer } from "@/components/radar/RadarBlipDotLayer";
import {
  ADOPTED_AREA_RIGHT_PAD,
  ADOPTED_DOT_RADIUS,
  IGNORED_AREA_RIGHT_PAD,
  IGNORED_DOT_COLOR,
  IGNORED_DOT_RADIUS,
  IGNORED_LABEL_COLOR,
} from "@/components/radar/radarLayout";

/**
 * Renders the active blip last (on top) so its halo isn't occluded by its
 * neighbours. Only the ignored strip maps dots by hand — RadarBlipDotLayer
 * already sorts internally for the adopted strip.
 */
function byActiveLast(activeBlipId: string | null) {
  return (a: PositionedBlip, b: PositionedBlip) => {
    const aActive = activeBlipId === a.blip.id ? 1 : 0;
    const bActive = activeBlipId === b.blip.id ? 1 : 0;
    return aActive - bActive;
  };
}

interface RadarStripSectionProps {
  mode: "adopted" | "ignored";
  positioned: PositionedBlip[];
  sortedQuadrants: RadarQuadrant[];
  sectionName: string;
  labelY: number;
  size: number;
  activeBlipId: string | null;
  selectedBlipId: string | null;
  onHover: (id: string | null) => void;
  onClick: (blip: RadarBlip) => void;
}

/**
 * One horizontal blip strip below the radar circle — either the "Adopted"
 * section (coloured by quadrant via RadarBlipDotLayer) or the greyed-out
 * "Ignored" section. Rendered inside the parent <svg>.
 */
export function RadarStripSection({
  mode,
  positioned,
  sortedQuadrants,
  sectionName,
  labelY,
  size,
  activeBlipId,
  selectedBlipId,
  onHover,
  onClick,
}: RadarStripSectionProps) {
  const isAdopted = mode === "adopted";
  const labelX
    = size - (isAdopted ? ADOPTED_AREA_RIGHT_PAD : IGNORED_AREA_RIGHT_PAD);
  const labelColor = isAdopted ? "#b45309" : IGNORED_LABEL_COLOR;

  return (
    <>
      <text
        x={labelX}
        y={labelY}
        textAnchor="end"
        fontSize={11}
        fontWeight="600"
        fill={labelColor}
      >
        {sectionName}
      </text>
      {isAdopted
        ? (
          <RadarBlipDotLayer
            positioned={positioned}
            sortedQuadrants={sortedQuadrants}
            activeBlipId={activeBlipId}
            selectedBlipId={selectedBlipId}
            keyPrefix="adopted-"
            dotRadius={ADOPTED_DOT_RADIUS}
            haloRadius={ADOPTED_DOT_RADIUS + 5}
            fontSize={9}
            clampQuadrantIndex
            renderSubtitle={quadrantName => (
              <>
                {quadrantName}
                {" · "}
                {sectionName}
              </>
            )}
            onHover={onHover}
            onClick={onClick}
          />
        )
        : (
          [...positioned]
            .sort(byActiveLast(activeBlipId))
            .map(({
              blip, x, y, index,
            }) => (
              <RadarBlipDot
                key={`ignored-${blip.id}`}
                blip={blip}
                x={x}
                y={y}
                index={index}
                color={IGNORED_DOT_COLOR}
                dotRadius={IGNORED_DOT_RADIUS}
                haloRadius={IGNORED_DOT_RADIUS + 5}
                fontSize={9}
                subtitle="Ignored"
                isActive={activeBlipId === blip.id}
                isSelected={selectedBlipId === blip.id}
                onHover={onHover}
                onClick={onClick}
              />
            ))
        )}
    </>
  );
}
