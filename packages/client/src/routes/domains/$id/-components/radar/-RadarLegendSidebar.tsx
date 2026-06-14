import type { PositionedBlip } from "@/components/radar/radarLayout";
import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

import { RadarLegend } from "@/components/radar/RadarLegend";

interface RadarLegendSidebarProps {
  sortedQuadrants: RadarQuadrant[];
  sortedRings: RadarRing[];
  positionedBlips: PositionedBlip[];
  adoptedBlips: RadarBlip[];
  adoptedSectionName: string;
  ignoredBlips: RadarBlip[];
  showAdoptedDots: boolean;
  setShowAdoptedDots: (value: boolean) => void;
  showIgnoredDots: boolean;
  setShowIgnoredDots: (value: boolean) => void;
  activeBlipId: string | null;
  selectedBlipId: string | null;
  onDescriptionChange: (blipId: string, value: string) => void;
  onHover: (id: string | null) => void;
  onBlipClick: (blip: RadarBlip) => void;
}

/**
 * Sidebar beside the radar circle: checkboxes that surface the Adopted/Ignored
 * dot strips on the chart, plus the full RadarLegend. The toggle state lives in
 * -RadarChart (it feeds the layout hook), so it's passed in with its setters.
 */
export function RadarLegendSidebar({
  sortedQuadrants,
  sortedRings,
  positionedBlips,
  adoptedBlips,
  adoptedSectionName,
  ignoredBlips,
  showAdoptedDots,
  setShowAdoptedDots,
  showIgnoredDots,
  setShowIgnoredDots,
  activeBlipId,
  selectedBlipId,
  onDescriptionChange,
  onHover,
  onBlipClick,
}: RadarLegendSidebarProps) {
  return (
    <div
      className={`
        flex flex-col gap-2
        lg:w-80
      `}
    >
      {adoptedBlips.length > 0 && (
        <label className="flex flex-row items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showAdoptedDots}
            onChange={e => setShowAdoptedDots(e.target.checked)}
          />
          Show
          {" "}
          {adoptedSectionName}
          {" "}
          dots on radar
        </label>
      )}
      {ignoredBlips.length > 0 && (
        <label className="flex flex-row items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showIgnoredDots}
            onChange={e => setShowIgnoredDots(e.target.checked)}
          />
          Show Ignored dots on radar
        </label>
      )}
      <RadarLegend
        quadrants={sortedQuadrants}
        positionedBlips={positionedBlips}
        rings={sortedRings}
        adoptedBlips={adoptedBlips}
        adoptedSectionName={adoptedSectionName}
        ignoredBlips={ignoredBlips}
        onDescriptionChange={onDescriptionChange}
        onHover={onHover}
        activeBlipId={activeBlipId}
        selectedBlipId={selectedBlipId}
        onBlipClick={onBlipClick}
      />
    </div>
  );
}
