import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

export type SortKey = "topic" | "slice" | "ring" | "items";
export type SortDir = "asc" | "desc";

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
  sortDir: SortDir;
}

export interface BlipFilterLookups {
  quadrantById: Map<string, RadarQuadrant>;
  ringById: Map<string, RadarRing>;
  topicItemCount: (topicId: string) => number;
}

export function filterAndSortBlips(
  blips: RadarBlip[],
  criteria: BlipFilterCriteria,
  lookups: BlipFilterLookups,
): RadarBlip[] {
  const {
    search, filterQuadrant, filterRing, sortKey, sortDir,
  } = criteria;
  const {
    quadrantById, ringById, topicItemCount,
  } = lookups;
  const query = search.trim().toLowerCase();
  const filtered = blips.filter((b) => {
    if (filterQuadrant === UNASSIGNED) {
      if (b.quadrantId !== null) return false;
    }
    else if (filterQuadrant !== ALL && b.quadrantId !== filterQuadrant) {
      return false;
    }
    if (filterRing === UNASSIGNED) {
      if (b.ringId !== null) return false;
    }
    else if (filterRing !== ALL && b.ringId !== filterRing) {
      return false;
    }
    if (query) {
      const topicName = b.topicName?.toLowerCase() ?? "";
      const note = b.description?.toLowerCase() ?? "";
      if (!topicName.includes(query) && !note.includes(query)) {
        return false;
      }
    }
    return true;
  });
  const dir = sortDir === "asc" ? 1 : -1;
  const sorted = filtered.slice().sort((a, b) => {
    let av: number | string;
    let bv: number | string;
    if (sortKey === "topic") {
      av = (a.topicName ?? "").toLowerCase();
      bv = (b.topicName ?? "").toLowerCase();
    }
    else if (sortKey === "slice") {
      av
        = quadrantById.get(a.quadrantId ?? "")?.position
          ?? Number.MAX_SAFE_INTEGER;
      bv
        = quadrantById.get(b.quadrantId ?? "")?.position
          ?? Number.MAX_SAFE_INTEGER;
    }
    else if (sortKey === "items") {
      av = topicItemCount(a.topicId);
      bv = topicItemCount(b.topicId);
    }
    else {
      av = ringById.get(a.ringId ?? "")?.position ?? Number.MAX_SAFE_INTEGER;
      bv = ringById.get(b.ringId ?? "")?.position ?? Number.MAX_SAFE_INTEGER;
    }
    if (av < bv) {
      return -1 * dir;
    }
    if (av > bv) {
      return 1 * dir;
    }
    return (a.topicName ?? "").localeCompare(b.topicName ?? "");
  });
  return sorted;
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
