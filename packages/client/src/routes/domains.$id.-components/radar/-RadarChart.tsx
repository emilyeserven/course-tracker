import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

import { useEffect, useRef, useState } from "react";

import { RadarBackground } from "./-RadarBackground";
import { RadarLegendSidebar } from "./-RadarLegendSidebar";
import { RadarStripSection } from "./-RadarStripSection";
import { useRadarChartData } from "./-useRadarChartData";

import { RadarBlipDotLayer } from "@/components/radar/RadarBlipDotLayer";
import {
  RADAR_LABEL_PADDING_X,
  RADAR_LABEL_PADDING_Y,
} from "@/components/radar/radarLayout";
import { TooltipProvider } from "@/components/ui/tooltip";

interface RadarChartProps {
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  blips: RadarBlip[];
  size?: number;
  onBlipClick?: (blip: RadarBlip) => void;
  onDescriptionChange?: (blipId: string, description: string) => void;
  showLegend?: boolean;
  initialSelectedBlipId?: string | null;
}

export function RadarChart({
  quadrants,
  rings,
  blips,
  size = 600,
  onBlipClick,
  onDescriptionChange,
  showLegend = true,
  initialSelectedBlipId = null,
}: RadarChartProps) {
  const [hoveredBlipId, setHoveredBlipId] = useState<string | null>(null);
  const [selectedBlipId, setSelectedBlipId] = useState<string | null>(
    initialSelectedBlipId,
  );
  const [showAdoptedDots, setShowAdoptedDots] = useState(false);
  const [showIgnoredDots, setShowIgnoredDots] = useState(false);
  const containerWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialSelectedBlipId) {
      setSelectedBlipId(initialSelectedBlipId);
    }
  }, [initialSelectedBlipId]);

  // Click outside the chart/legend area to clear the sticky selection. Ignore
  // clicks inside Radix portals (popovers, tooltips) so editing the
  // description doesn't deselect the active blip.
  useEffect(() => {
    if (!selectedBlipId) {
      return;
    }
    function handleDown(event: MouseEvent) {
      const wrap = containerWrapperRef.current;
      if (!wrap) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (wrap.contains(target)) return;
      if (
        target.closest(
          "[data-radix-popper-content-wrapper], [data-slot=\"popover-content\"], [data-slot=\"tooltip-content\"], [data-slot=\"select-content\"]",
        )
      ) {
        return;
      }
      setSelectedBlipId(null);
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [selectedBlipId]);

  const activeBlipId = selectedBlipId ?? hoveredBlipId;

  const {
    cx,
    cy,
    maxRadius,
    angleStep,
    quadrantCount,
    ringCount,
    sortedQuadrants,
    sortedRings,
    ringRadii,
    ringNameById,
    adoptedSectionName,
    adoptedBlips,
    ignoredBlips,
    positionedBlips,
    positionedAdoptedBlips,
    positionedIgnoredBlips,
    showAdoptedInChart,
    showIgnoredInChart,
    totalHeight,
    adoptedLabelY,
    ignoredLabelY,
  } = useRadarChartData({
    quadrants,
    rings,
    blips,
    size,
    showAdoptedDots,
    showIgnoredDots,
  });

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
        Configure at least one slice and one ring to display the radar.
      </div>
    );
  }

  const handleSetDescription = (blipId: string, value: string) => {
    onDescriptionChange?.(blipId, value);
  };

  const handleBlipClick = (blip: RadarBlip) => {
    setSelectedBlipId(prev => (prev === blip.id ? null : blip.id));
    onBlipClick?.(blip);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={containerWrapperRef}
        className={`
          flex flex-col gap-4
          lg:flex-row lg:items-start lg:gap-6
        `}
      >
        <div className="flex-1">
          <svg
            viewBox={`${-RADAR_LABEL_PADDING_X} ${-RADAR_LABEL_PADDING_Y} ${size + RADAR_LABEL_PADDING_X * 2} ${totalHeight + RADAR_LABEL_PADDING_Y * 2}`}
            width="100%"
            style={{
              maxWidth: size + RADAR_LABEL_PADDING_X * 2,
            }}
            role="img"
            aria-label="Radar chart"
          >
            <RadarBackground
              cx={cx}
              cy={cy}
              maxRadius={maxRadius}
              angleStep={angleStep}
              ringRadii={ringRadii}
              sortedRings={sortedRings}
              sortedQuadrants={sortedQuadrants}
            />
            <RadarBlipDotLayer
              positioned={positionedBlips}
              sortedQuadrants={sortedQuadrants}
              activeBlipId={activeBlipId}
              selectedBlipId={selectedBlipId}
              dotRadius={10}
              haloRadius={16}
              fontSize={10}
              renderSubtitle={(quadrantName, blip) => (
                <>
                  {quadrantName}
                  {" · "}
                  {ringNameById[blip.ringId ?? ""]}
                </>
              )}
              onHover={setHoveredBlipId}
              onClick={handleBlipClick}
            />
            {showAdoptedInChart && (
              <RadarStripSection
                mode="adopted"
                positioned={positionedAdoptedBlips}
                sortedQuadrants={sortedQuadrants}
                sectionName={adoptedSectionName}
                labelY={adoptedLabelY}
                size={size}
                activeBlipId={activeBlipId}
                selectedBlipId={selectedBlipId}
                onHover={setHoveredBlipId}
                onClick={handleBlipClick}
              />
            )}
            {showIgnoredInChart && (
              <RadarStripSection
                mode="ignored"
                positioned={positionedIgnoredBlips}
                sortedQuadrants={sortedQuadrants}
                sectionName="Ignored"
                labelY={ignoredLabelY}
                size={size}
                activeBlipId={activeBlipId}
                selectedBlipId={selectedBlipId}
                onHover={setHoveredBlipId}
                onClick={handleBlipClick}
              />
            )}
          </svg>
        </div>
        {showLegend && (
          <RadarLegendSidebar
            sortedQuadrants={sortedQuadrants}
            sortedRings={sortedRings}
            positionedBlips={positionedBlips}
            adoptedBlips={adoptedBlips}
            adoptedSectionName={adoptedSectionName}
            ignoredBlips={ignoredBlips}
            showAdoptedDots={showAdoptedDots}
            setShowAdoptedDots={setShowAdoptedDots}
            showIgnoredDots={showIgnoredDots}
            setShowIgnoredDots={setShowIgnoredDots}
            activeBlipId={activeBlipId}
            selectedBlipId={selectedBlipId}
            onDescriptionChange={handleSetDescription}
            onHover={setHoveredBlipId}
            onBlipClick={handleBlipClick}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
