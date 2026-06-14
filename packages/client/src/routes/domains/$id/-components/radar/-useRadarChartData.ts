import type { PositionedBlip } from "@/components/radar/radarLayout";
import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

import { useMemo } from "react";

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
  IGNORED_DOT_RADIUS,
  IGNORED_DOT_SPACING,
  IGNORED_LABEL_GAP,
  computeRingRadii,
  layoutStripBlips,
  positionRadarBlips,
} from "@/components/radar/radarLayout";

interface UseRadarChartDataParams {
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  blips: RadarBlip[];
  size: number;
  showAdoptedDots: boolean;
  showIgnoredDots: boolean;
}

/**
 * Derives every geometry/layout value the radar chart renders from. Pure,
 * memoised data shaping — no React state or callbacks — so -RadarChart stays
 * focused on interaction state and assembly.
 */
export function useRadarChartData({
  quadrants,
  rings,
  blips,
  size,
  showAdoptedDots,
  showIgnoredDots,
}: UseRadarChartDataParams) {
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
  const adoptedRings = useMemo(() => rings.filter(r => r.isAdopted), [rings]);
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
        b =>
          !b.isIgnored && b.ringId !== null && adoptedRingIds.has(b.ringId),
      ),
    [blips, adoptedRingIds],
  );

  const ignoredBlips = useMemo(() => blips.filter(b => b.isIgnored), [blips]);

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
    [blips, sortedQuadrants, sortedRings, ringRadii, cx, cy, adoptedRingIds],
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
  }, [
    showAdoptedInChart,
    adoptedBlips,
    size,
    adoptedBandBottom,
    positionedBlips,
  ]);

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

  const angleStep = quadrantCount > 0 ? (Math.PI * 2) / quadrantCount : 0;
  const adoptedLabelY = size + ADOPTED_LABEL_GAP;
  const ignoredLabelY = ignoredBandTop + IGNORED_LABEL_GAP;

  return {
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
  };
}
