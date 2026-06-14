import type { QuadrantDraft, RingDraft } from "./-RadarConfigTab";

// Pure helpers that map a saved radar's quadrants/rings into the editable draft
// shapes the ConfigTab renders (and supply sensible defaults for a fresh radar).
// Kept out of the component so the transforms are unit-testable in isolation.

export const QUADRANT_COUNT = 5;
export const MAX_RINGS = 6;

const DEFAULT_QUADRANTS = [
  "Languages & Frameworks",
  "Tools",
  "Platforms",
  "Techniques",
  "Practices",
];

const DEFAULT_RINGS = ["Adopt", "Trial", "Assess", "Hold"];

let localKeyCounter = 0;
export function nextLocalKey() {
  localKeyCounter += 1;
  return `local-${localKeyCounter}`;
}

export function quadrantsFromServer(
  items: { id: string;
    name: string;
    position: number; }[],
): QuadrantDraft[] {
  const fromServer: QuadrantDraft[] = items
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(q => ({
      id: q.id,
      name: q.name,
      position: q.position,
      localKey: q.id,
    }));
  while (fromServer.length < QUADRANT_COUNT) {
    fromServer.push({
      name: "",
      position: fromServer.length,
      localKey: nextLocalKey(),
    });
  }
  return fromServer.map((q, idx) => ({
    ...q,
    position: idx,
  }));
}

export function ringsFromServer(
  items: { id: string;
    name: string;
    position: number;
    isAdopted?: boolean; }[],
): RingDraft[] {
  return items
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(r => ({
      id: r.id,
      name: r.name,
      position: r.position,
      localKey: r.id,
      isAdopted: r.isAdopted ?? false,
    }));
}

export function defaultQuadrants(): QuadrantDraft[] {
  return DEFAULT_QUADRANTS.slice(0, QUADRANT_COUNT).map((name, idx) => ({
    name,
    position: idx,
    localKey: nextLocalKey(),
  }));
}

export function defaultRings(): RingDraft[] {
  return DEFAULT_RINGS.map((name, idx) => ({
    name,
    position: idx,
    localKey: nextLocalKey(),
  }));
}
