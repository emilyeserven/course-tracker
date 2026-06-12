import type { RadarBlip } from "@emstack/types";

import { describe, expect, test } from "vitest";

import type {
  BlipFilterCriteria,
  BlipFilterLookups,
  QuadrantInfo,
  RingInfo,
} from "./blipTableFilters";

import {
  ALL,
  countByField,
  filterAndSortBlips,
  UNASSIGNED,
} from "./blipTableFilters";

function makeBlip(overrides: Partial<RadarBlip> & { id: string }): RadarBlip {
  return {
    domainId: "domain-1",
    quadrantId: null,
    ringId: null,
    topicId: `topic-${overrides.id}`,
    topicName: `Topic ${overrides.id}`,
    description: null,
    isIgnored: false,
    ...overrides,
  };
}

const quadrants: QuadrantInfo[] = [
  {
    id: "q1",
    name: "Languages",
    position: 0,
  },
  {
    id: "q2",
    name: "Tools",
    position: 1,
  },
];

// Test fixture data; incidental overlap with the production Map-building code.
// fallow-ignore-next-line code-duplication
const rings: RingInfo[] = [
  {
    id: "r1",
    name: "Adopt",
    position: 0,
  },
  {
    id: "r2",
    name: "Assess",
    position: 1,
  },
];

const quadrantById = new Map(quadrants.map(q => [q.id, q]));
const ringById = new Map(rings.map(r => [r.id, r]));

function makeLookups(
  itemCounts: Record<string, number> = {},
): BlipFilterLookups {
  return {
    quadrantById,
    ringById,
    topicItemCount: (topicId: string) => itemCounts[topicId] ?? 0,
  };
}

function makeCriteria(
  overrides: Partial<BlipFilterCriteria> = {},
): BlipFilterCriteria {
  return {
    search: "",
    filterQuadrant: ALL,
    filterRing: ALL,
    sortKey: "topic",
    sortDir: "asc",
    ...overrides,
  };
}

function ids(blips: RadarBlip[]): string[] {
  return blips.map(b => b.id);
}

describe("filterAndSortBlips filtering", () => {
  const blips = [
    makeBlip({
      id: "a",
      quadrantId: "q1",
      ringId: "r1",
    }),
    makeBlip({
      id: "b",
      quadrantId: "q2",
      ringId: null,
    }),
    makeBlip({
      id: "c",
      quadrantId: null,
      ringId: "r2",
    }),
    makeBlip({
      id: "d",
      quadrantId: null,
      ringId: null,
    }),
  ];

  test("ALL keeps every blip", () => {
    const result = filterAndSortBlips(blips, makeCriteria(), makeLookups());
    expect(result).toHaveLength(4);
  });

  test("unassigned-quadrant filter keeps only blips without a quadrant", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        filterQuadrant: UNASSIGNED,
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["c", "d"]);
  });

  test("unassigned-ring filter keeps only blips without a ring", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        filterRing: UNASSIGNED,
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["b", "d"]);
  });

  test("a specific quadrant filter keeps only that quadrant's blips", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        filterQuadrant: "q1",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["a"]);
  });

  test("a specific ring filter keeps only that ring's blips", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        filterRing: "r2",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["c"]);
  });

  test("quadrant and ring filters combine", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        filterQuadrant: UNASSIGNED,
        filterRing: UNASSIGNED,
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["d"]);
  });
});

describe("filterAndSortBlips search", () => {
  const blips = [
    makeBlip({
      id: "a",
      topicName: "TypeScript",
      description: "strongly typed",
    }),
    makeBlip({
      id: "b",
      topicName: "Rust",
      description: "memory safe systems language",
    }),
    makeBlip({
      id: "c",
      topicName: "Go",
      description: null,
    }),
  ];

  test("matches the topic name case-insensitively", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        search: "typescript",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["a"]);
  });

  test("matches the note text case-insensitively", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        search: "MEMORY SAFE",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["b"]);
  });

  test("matches across topic name and note text at once", () => {
    const withSharedTerm = [
      ...blips,
      makeBlip({
        id: "d",
        topicName: "Zig",
        description: "a typed alternative",
      }),
    ];
    const result = filterAndSortBlips(
      withSharedTerm,
      makeCriteria({
        search: "type",
      }),
      makeLookups(),
    );
    // "type" hits TypeScript's name and Zig's note.
    expect(ids(result).sort()).toEqual(["a", "d"]);
  });

  test("ignores surrounding whitespace in the query", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        search: "  rust  ",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["b"]);
  });

  test("drops blips matching neither name nor note", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        search: "nonexistent",
      }),
      makeLookups(),
    );
    expect(result).toHaveLength(0);
  });
});

describe("filterAndSortBlips sorting", () => {
  const blips = [
    makeBlip({
      id: "a",
      topicName: "Charlie",
      quadrantId: "q2",
      ringId: "r2",
      topicId: "topic-a",
    }),
    makeBlip({
      id: "b",
      topicName: "Alpha",
      quadrantId: "q1",
      ringId: "r1",
      topicId: "topic-b",
    }),
    makeBlip({
      id: "c",
      topicName: "Bravo",
      quadrantId: null,
      ringId: null,
      topicId: "topic-c",
    }),
  ];
  const itemCounts = {
    "topic-a": 2,
    "topic-b": 7,
    "topic-c": 0,
  };

  test("sorts by topic name ascending", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "topic",
        sortDir: "asc",
      }),
      makeLookups(itemCounts),
    );
    expect(ids(result)).toEqual(["b", "c", "a"]);
  });

  test("sorts by topic name descending", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "topic",
        sortDir: "desc",
      }),
      makeLookups(itemCounts),
    );
    expect(ids(result)).toEqual(["a", "c", "b"]);
  });

  test("sorts by slice position ascending with unassigned last", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "slice",
        sortDir: "asc",
      }),
      makeLookups(itemCounts),
    );
    expect(ids(result)).toEqual(["b", "a", "c"]);
  });

  test("sorts by slice position descending with unassigned first", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "slice",
        sortDir: "desc",
      }),
      makeLookups(itemCounts),
    );
    expect(ids(result)).toEqual(["c", "a", "b"]);
  });

  test("sorts by ring position ascending with unassigned last", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "ring",
        sortDir: "asc",
      }),
      makeLookups(itemCounts),
    );
    expect(ids(result)).toEqual(["b", "a", "c"]);
  });

  test("sorts by ring position descending with unassigned first", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "ring",
        sortDir: "desc",
      }),
      makeLookups(itemCounts),
    );
    expect(ids(result)).toEqual(["c", "a", "b"]);
  });

  test("sorts by topic item count ascending", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "items",
        sortDir: "asc",
      }),
      makeLookups(itemCounts),
    );
    expect(ids(result)).toEqual(["c", "a", "b"]);
  });

  test("sorts by topic item count descending", () => {
    const result = filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "items",
        sortDir: "desc",
      }),
      makeLookups(itemCounts),
    );
    expect(ids(result)).toEqual(["b", "a", "c"]);
  });

  test("does not mutate the input array", () => {
    const original = blips.slice();
    filterAndSortBlips(
      blips,
      makeCriteria({
        sortKey: "topic",
        sortDir: "desc",
      }),
      makeLookups(itemCounts),
    );
    expect(blips).toEqual(original);
  });
});

describe("filterAndSortBlips topic-name tiebreak", () => {
  const tied = [
    makeBlip({
      id: "a",
      topicName: "Zulu",
      quadrantId: "q1",
      ringId: "r1",
    }),
    makeBlip({
      id: "b",
      topicName: "Alpha",
      quadrantId: "q1",
      ringId: "r1",
    }),
    makeBlip({
      id: "c",
      topicName: "Mike",
      quadrantId: "q1",
      ringId: "r1",
    }),
  ];

  test("blips in the same slice fall back to topic-name order", () => {
    const result = filterAndSortBlips(
      tied,
      makeCriteria({
        sortKey: "slice",
        sortDir: "asc",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["b", "c", "a"]);
  });

  test("the tiebreak stays alphabetical even when sorting descending", () => {
    const result = filterAndSortBlips(
      tied,
      makeCriteria({
        sortKey: "slice",
        sortDir: "desc",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["b", "c", "a"]);
  });

  test("blips in the same ring fall back to topic-name order", () => {
    const result = filterAndSortBlips(
      tied,
      makeCriteria({
        sortKey: "ring",
        sortDir: "asc",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["b", "c", "a"]);
  });

  test("blips with equal item counts fall back to topic-name order", () => {
    const result = filterAndSortBlips(
      tied,
      makeCriteria({
        sortKey: "items",
        sortDir: "asc",
      }),
      makeLookups(),
    );
    expect(ids(result)).toEqual(["b", "c", "a"]);
  });
});

describe("countByField", () => {
  const blips = [
    makeBlip({
      id: "a",
      quadrantId: "q1",
      ringId: "r1",
    }),
    makeBlip({
      id: "b",
      quadrantId: "q1",
      ringId: null,
    }),
    makeBlip({
      id: "c",
      quadrantId: "q2",
      ringId: "r2",
    }),
    makeBlip({
      id: "d",
      quadrantId: null,
      ringId: null,
    }),
  ];

  test("counts blips per quadrant and tallies unassigned ones", () => {
    const result = countByField(blips, "quadrantId");
    expect(result.counts.get("q1")).toBe(2);
    expect(result.counts.get("q2")).toBe(1);
    expect(result.unassigned).toBe(1);
  });

  test("counts blips per ring and tallies unassigned ones", () => {
    const result = countByField(blips, "ringId");
    expect(result.counts.get("r1")).toBe(1);
    expect(result.counts.get("r2")).toBe(1);
    expect(result.unassigned).toBe(2);
  });

  test("returns zero counts for an empty list", () => {
    const result = countByField([], "quadrantId");
    expect(result.counts.size).toBe(0);
    expect(result.unassigned).toBe(0);
  });
});
