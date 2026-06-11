import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

export interface PositionedBlip {
  blip: RadarBlip;
  x: number;
  y: number;
  index: number;
}

export const QUADRANT_PALETTE = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#db2777",
];

export const ADOPTED_DOT_RADIUS = 8;
export const ADOPTED_DOT_SPACING = 22;
export const ADOPTED_AREA_BOTTOM_PAD = 12;
export const ADOPTED_AREA_RIGHT_PAD = 12;
export const ADOPTED_AREA_HEIGHT = 96;
export const ADOPTED_LABEL_GAP = 18;

// Ignored ("out of scope") dots get their own strip beneath the Adopted one.
// They carry no slice, so they render in a neutral gray.
export const IGNORED_DOT_RADIUS = 8;
export const IGNORED_DOT_SPACING = 22;
export const IGNORED_AREA_BOTTOM_PAD = 12;
export const IGNORED_AREA_RIGHT_PAD = 12;
export const IGNORED_AREA_HEIGHT = 96;
export const IGNORED_LABEL_GAP = 18;
export const IGNORED_DOT_COLOR = "#6b7280";
export const IGNORED_LABEL_COLOR = "#4b5563";

// Deterministic pseudo-random in [0, 1) from a string. Used to keep blip
// placements stable across renders without storing coordinates in the DB.
export function hashUnit(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export function computeRingRadii(
  ringCount: number,
  maxRadius: number,
): number[] {
  if (ringCount === 0) {
    return [];
  }
  return Array.from(
    {
      length: ringCount,
    },
    (_ring, idx) => ((idx + 1) / ringCount) * maxRadius,
  );
}

export function positionRadarBlips({
  blips,
  sortedQuadrants,
  sortedRings,
  ringRadii,
  adoptedRingIds,
  cx,
  cy,
}: {
  blips: RadarBlip[];
  sortedQuadrants: RadarQuadrant[];
  sortedRings: RadarRing[];
  ringRadii: number[];
  adoptedRingIds: Set<string>;
  cx: number;
  cy: number;
}): PositionedBlip[] {
  const quadrantCount = sortedQuadrants.length;
  const ringCount = sortedRings.length;
  if (quadrantCount === 0 || ringCount === 0) {
    return [];
  }
  const angleStep = (Math.PI * 2) / quadrantCount;
  let displayIndex = 0;
  return blips
    .map((blip) => {
      if (blip.isIgnored) {
        return null;
      }
      if (blip.ringId !== null && adoptedRingIds.has(blip.ringId)) {
        return null;
      }
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
}

// Lay out strip dots right-to-left, bottom-up in a band below the radar
// circle (bottom-right of the radar graphic). Used for both the Adopted and
// Ignored strips, which share identical math.
export function layoutStripBlips({
  blips,
  size,
  bandBottom,
  startIndex,
  dotRadius,
  dotSpacing,
  rightPad,
  bottomPad,
}: {
  blips: RadarBlip[];
  size: number;
  bandBottom: number;
  startIndex: number;
  dotRadius: number;
  dotSpacing: number;
  rightPad: number;
  bottomPad: number;
}): PositionedBlip[] {
  const startX = size - rightPad - dotRadius;
  const startY = bandBottom - bottomPad - dotRadius;
  const cols = Math.max(
    1,
    Math.floor((size / 2) / dotSpacing),
  );
  return blips.map((blip, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    return {
      blip,
      x: startX - col * dotSpacing,
      y: startY - row * dotSpacing,
      index: startIndex + i + 1,
    };
  });
}
