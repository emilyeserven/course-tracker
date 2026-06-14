import { describe, expect, test } from "vitest";

import {
  defaultQuadrants,
  defaultRings,
  QUADRANT_COUNT,
  quadrantsFromServer,
  ringsFromServer,
} from "./-radarConfigDrafts";

describe("quadrantsFromServer", () => {
  test("pads up to QUADRANT_COUNT with blank trailing slices", () => {
    const drafts = quadrantsFromServer([
      {
        id: "q1",
        name: "Tools",
        position: 0,
      },
      {
        id: "q2",
        name: "Platforms",
        position: 1,
      },
    ]);

    expect(drafts).toHaveLength(QUADRANT_COUNT);
    expect(drafts.slice(0, 2).map(q => q.name)).toEqual([
      "Tools",
      "Platforms",
    ]);
    expect(drafts.slice(2).every(q => q.name === "")).toBe(true);
  });

  test("sorts by server position and reindexes positions 0..n", () => {
    const drafts = quadrantsFromServer([
      {
        id: "b",
        name: "Second",
        position: 5,
      },
      {
        id: "a",
        name: "First",
        position: 1,
      },
    ]);

    expect(drafts.slice(0, 2).map(q => q.name)).toEqual(["First", "Second"]);
    expect(drafts.map(q => q.position)).toEqual([0, 1, 2, 3, 4]);
  });

  test("keeps the server id as the localKey for persisted slices", () => {
    const drafts = quadrantsFromServer([
      {
        id: "q1",
        name: "Tools",
        position: 0,
      },
    ]);

    expect(drafts[0].id).toBe("q1");
    expect(drafts[0].localKey).toBe("q1");
  });
});

describe("ringsFromServer", () => {
  test("sorts by position and preserves ids/names without padding", () => {
    const drafts = ringsFromServer([
      {
        id: "r2",
        name: "Trial",
        position: 1,
      },
      {
        id: "r1",
        name: "Adopt",
        position: 0,
      },
    ]);

    expect(drafts.map(r => r.name)).toEqual(["Adopt", "Trial"]);
    expect(drafts.map(r => r.id)).toEqual(["r1", "r2"]);
  });

  test("defaults isAdopted to false, preserving an explicit true", () => {
    const drafts = ringsFromServer([
      {
        id: "r1",
        name: "Adopt",
        position: 0,
      },
      {
        id: "r2",
        name: "Adopted",
        position: 1,
        isAdopted: true,
      },
    ]);

    expect(drafts.map(r => r.isAdopted)).toEqual([false, true]);
  });
});

describe("defaults", () => {
  test("defaultQuadrants returns QUADRANT_COUNT slices indexed 0..n", () => {
    const drafts = defaultQuadrants();

    expect(drafts).toHaveLength(QUADRANT_COUNT);
    expect(drafts.map(q => q.position)).toEqual([0, 1, 2, 3, 4]);
    expect(drafts.every(q => q.name.length > 0)).toBe(true);
  });

  test("defaultRings returns the four standard rings", () => {
    expect(defaultRings().map(r => r.name)).toEqual([
      "Adopt",
      "Trial",
      "Assess",
      "Hold",
    ]);
  });
});
