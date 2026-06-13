import type { PositionedBlip } from "@/components/radar/radarLayout";
import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

import { useEffect, useMemo, useRef, useState } from "react";

import { RadarBlipDot } from "@/components/radar/RadarBlipDot";
import { RadarBlipDotLayer } from "@/components/radar/RadarBlipDotLayer";
import {
  ADOPTED_AREA_BOTTOM_PAD,
  ADOPTED_AREA_HEIGHT,
  ADOPTED_AREA_RIGHT_PAD,
  ADOPTED_DOT_RADIUS,
  ADOPTED_DOT_SPACING,
  ADOPTED_LABEL_GAP,
  IGNORED_AREA_BOTTOM_PAD,
  IGNORED_AREA_HEIGHT,
  IGNORED_AREA_RIGHT_PAD,
  IGNORED_DOT_COLOR,
  IGNORED_DOT_RADIUS,
  IGNORED_DOT_SPACING,
  IGNORED_LABEL_COLOR,
  IGNORED_LABEL_GAP,
  QUADRANT_PALETTE,
  RADAR_LABEL_PADDING_X,
  RADAR_LABEL_PADDING_Y,
  computeRingRadii,
  layoutStripBlips,
  positionRadarBlips,

} from "@/components/radar/radarLayout";
import { RadarLegend } from "@/components/radar/RadarLegend";
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

/**
 * Comparator that renders the active blip last (on top) so its halo isn't
 * occluded by neighbouring dots.
 */
function byActiveLast(activeBlipId: string | null) {
  return (a: PositionedBlip, b: PositionedBlip) => {
    const aActive = activeBlipId === a.blip.id ? 1 : 0;
    const bActive = activeBlipId === b.blip.id ? 1 : 0;
    return aActive - bActive;
  };
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

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 24;

  const sortedQuadrants = useMemo(
    () => [...quadrants].sort((a, b) => a.position - b.position),
    [quadrants],
  );
  const sortedRings = useMemo(
    () =>
      [...rings]
        .filter(r => !r.isAdopted)
        .sort((a, b) => a.position - b.position),
    [rings],
  );
  const adoptedRings = useMemo(
    () => rings.filter(r => r.isAdopted),
    [rings],
  );
  const adoptedRingIds = useMemo(() => {
    const set = new Set<string>();
    adoptedRings.forEach(r => set.add(r.id));
    return set;
  }, [adoptedRings]);
  const adoptedSectionName = adoptedRings[0]?.name ?? "Adopted";

  const quadrantCount = sortedQuadrants.length;
  const ringCount = sortedRings.length;

  const ringRadii = useMemo(
    () => computeRingRadii(ringCount, maxRadius),
    [ringCount, maxRadius],
  );

  const ringNameById = useMemo(() => {
    const map: Record<string, string> = {};
    [...rings].forEach((r) => {
      map[r.id] = r.name;
    });
    return map;
  }, [rings]);

  const adoptedBlips = useMemo(
    () =>
      blips.filter(
        b => !b.isIgnored && b.ringId !== null && adoptedRingIds.has(b.ringId),
      ),
    [blips, adoptedRingIds],
  );

  const ignoredBlips = useMemo(
    () => blips.filter(b => b.isIgnored),
    [blips],
  );

  const positionedBlips = useMemo<PositionedBlip[]>(
    () =>
      positionRadarBlips({
        blips,
        sortedQuadrants,
        sortedRings,
        ringRadii,
        adoptedRingIds,
        cx,
        cy,
      }),
    [
      blips,
      sortedQuadrants,
      sortedRings,
      ringRadii,
      cx,
      cy,
      adoptedRingIds,
    ],
  );

  const showAdoptedInChart = showAdoptedDots && adoptedBlips.length > 0;
  const showIgnoredInChart = showIgnoredDots && ignoredBlips.length > 0;
  const adoptedAreaHeight = showAdoptedInChart ? ADOPTED_AREA_HEIGHT : 0;
  const ignoredAreaHeight = showIgnoredInChart ? IGNORED_AREA_HEIGHT : 0;
  const totalHeight = size + adoptedAreaHeight + ignoredAreaHeight;
  // The Adopted strip sits directly below the circle; the Ignored strip sits
  // below the Adopted one.
  const adoptedBandBottom = size + adoptedAreaHeight;
  const ignoredBandTop = size + adoptedAreaHeight;

  const positionedAdoptedBlips = useMemo<PositionedBlip[]>(() => {
    if (!showAdoptedInChart) return [];
    return layoutStripBlips({
      blips: adoptedBlips,
      size,
      bandBottom: adoptedBandBottom,
      startIndex: positionedBlips.length,
      dotRadius: ADOPTED_DOT_RADIUS,
      dotSpacing: ADOPTED_DOT_SPACING,
      rightPad: ADOPTED_AREA_RIGHT_PAD,
      bottomPad: ADOPTED_AREA_BOTTOM_PAD,
    });
  }, [showAdoptedInChart, adoptedBlips, size, adoptedBandBottom, positionedBlips]);

  const positionedIgnoredBlips = useMemo<PositionedBlip[]>(() => {
    if (!showIgnoredInChart) return [];
    return layoutStripBlips({
      blips: ignoredBlips,
      size,
      bandBottom: totalHeight,
      startIndex: positionedBlips.length + adoptedBlips.length,
      dotRadius: IGNORED_DOT_RADIUS,
      dotSpacing: IGNORED_DOT_SPACING,
      rightPad: IGNORED_AREA_RIGHT_PAD,
      bottomPad: IGNORED_AREA_BOTTOM_PAD,
    });
  }, [
    showIgnoredInChart,
    ignoredBlips,
    size,
    totalHeight,
    positionedBlips,
    adoptedBlips,
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
        Configure at least one slice and one ring to display the radar.
      </div>
    );
  }

  const angleStep = (Math.PI * 2) / quadrantCount;

  const handleSetDescription = (blipId: string, value: string) => {
    onDescriptionChange?.(blipId, value);
  };

  const handleBlipClick = (blip: RadarBlip) => {
    setSelectedBlipId(prev => (prev === blip.id ? null : blip.id));
    onBlipClick?.(blip);
  };

  const adoptedLabelY = size + ADOPTED_LABEL_GAP;
  const ignoredLabelY = ignoredBandTop + IGNORED_LABEL_GAP;

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
              <>
                <text
                  x={size - ADOPTED_AREA_RIGHT_PAD}
                  y={adoptedLabelY}
                  textAnchor="end"
                  fontSize={11}
                  fontWeight="600"
                  fill="#b45309"
                >
                  {adoptedSectionName}
                </text>
                <RadarBlipDotLayer
                  positioned={positionedAdoptedBlips}
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
                      {adoptedSectionName}
                    </>
                  )}
                  onHover={setHoveredBlipId}
                  onClick={handleBlipClick}
                />
              </>
            )}
            {showIgnoredInChart && (
              <>
                <text
                  x={size - IGNORED_AREA_RIGHT_PAD}
                  y={ignoredLabelY}
                  textAnchor="end"
                  fontSize={11}
                  fontWeight="600"
                  fill={IGNORED_LABEL_COLOR}
                >
                  Ignored
                </text>
                {[...positionedIgnoredBlips]
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
                      onHover={setHoveredBlipId}
                      onClick={handleBlipClick}
                    />
                  ))}
              </>
            )}
          </svg>
        </div>
        {showLegend && (
          <div
            className={`
              flex flex-col gap-2
              lg:w-80
            `}
          >
            {adoptedBlips.length > 0 && (
              <label
                className="flex flex-row items-center gap-2 text-sm"
              >
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
              <label
                className="flex flex-row items-center gap-2 text-sm"
              >
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
              onDescriptionChange={handleSetDescription}
              onHover={setHoveredBlipId}
              activeBlipId={activeBlipId}
              selectedBlipId={selectedBlipId}
              onBlipClick={handleBlipClick}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
