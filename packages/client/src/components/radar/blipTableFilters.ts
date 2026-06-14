import type { SortDirection } from "@/components/ui/manualSort";
import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

export type SortKey = "topic" | "slice" | "ring" | "items";

export interface BulkPatch {
  quadrantId?: string;
  ringId?: string;
}

export const ALL = "__all__";
export const UNASSIGNED = "__unassigned__";
export const NO_CHANGE = "__no_change__";

export interface BlipFilterCriteria {
  search: string;
  filterQuadrant: string;
  filterRing: string;
  sortKey: SortKey;
  sortDir: SortDirection;
}

export interface BlipFilterLookups {
  quadrantById: Map<string, RadarQuadrant>;
  ringById: Map<string, RadarRing>;
  topicItemCount: (topicId: string) => number;
}

function matchesFieldFilter(
  value: string | null,
  filterValue: string,
): boolean {
  if (filterValue === UNASSIGNED) return value === null;
  if (filterValue === ALL) return true;
  return value === filterValue;
}

export function filterBlips(
  blips: RadarBlip[],
  criteria: BlipFilterCriteria,
): RadarBlip[] {
  const {
    search, filterQuadrant, filterRing,
  } = criteria;
  const query = search.trim().toLowerCase();
  return blips.filter((b) => {
    if (!matchesFieldFilter(b.quadrantId, filterQuadrant)) return false;
    if (!matchesFieldFilter(b.ringId, filterRing)) return false;
    if (query) {
      const topicName = b.topicName?.toLowerCase() ?? "";
      const note = b.description?.toLowerCase() ?? "";
      if (!topicName.includes(query) && !note.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

function positionOf(
  byId: Map<string, { position: number }>,
  id: string | null,
): number {
  return byId.get(id ?? "")?.position ?? Number.MAX_SAFE_INTEGER;
}

export function blipSortValue(
  blip: RadarBlip,
  sortKey: SortKey,
  lookups: BlipFilterLookups,
): number | string {
  const {
    quadrantById, ringById, topicItemCount,
  } = lookups;
  switch (sortKey) {
    case "topic":
      return (blip.topicName ?? "").toLowerCase();
    case "slice":
      return positionOf(quadrantById, blip.quadrantId);
    case "items":
      return topicItemCount(blip.topicId);
    default:
      return positionOf(ringById, blip.ringId);
  }
}

export function sortBlips(
  blips: RadarBlip[],
  criteria: BlipFilterCriteria,
  lookups: BlipFilterLookups,
): RadarBlip[] {
  const {
    sortKey, sortDir,
  } = criteria;
  const dir = sortDir === "asc" ? 1 : -1;
  return blips.slice().sort((a, b) => {
    const av = blipSortValue(a, sortKey, lookups);
    const bv = blipSortValue(b, sortKey, lookups);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return (a.topicName ?? "").localeCompare(b.topicName ?? "");
  });
}

export function filterAndSortBlips(
  blips: RadarBlip[],
  criteria: BlipFilterCriteria,
  lookups: BlipFilterLookups,
): RadarBlip[] {
  return sortBlips(filterBlips(blips, criteria), criteria, lookups);
}

export function countByField(
  blips: RadarBlip[],
  field: "quadrantId" | "ringId",
): { counts: Map<string, number>;
  unassigned: number; } {
  const counts = new Map<string, number>();
  let unassigned = 0;
  blips.forEach((b) => {
    const value = b[field];
    if (value) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    else {
      unassigned += 1;
    }
  });
  return {
    counts,
    unassigned,
  };
}
