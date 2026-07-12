import type { RoutineCurated, RoutineWeekly } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  curatedDateRange,
  curatedToRows,
  fillAllDays,
  representativeRow,
  rowsToCurated,
  rowsToWeekly,
  weeklyToRows,
} from "./weekly";

describe("weekly schedule item notes", () => {
  test("weeklyToRows surfaces an item's notes", () => {
    const weekly: RoutineWeekly = {
      1: {
        type: "task",
        id: "task-1",
        notes: "focus on the subjunctive",
      },
    };
    const monday = weeklyToRows(weekly).find(r => r.day === "1");
    expect(monday?.notes).toBe("focus on the subjunctive");
  });

  test("weeklyToRows defaults a missing note to an empty string", () => {
    const weekly: RoutineWeekly = {
      2: {
        type: "task",
        id: "task-1",
      },
    };
    const tuesday = weeklyToRows(weekly).find(r => r.day === "2");
    expect(tuesday?.notes).toBe("");
  });

  test("rowsToWeekly preserves a non-empty note", () => {
    const weekly: RoutineWeekly = {
      3: {
        type: "task",
        id: "task-9",
        notes: "do exercises 1-5",
      },
    };
    expect(rowsToWeekly(weeklyToRows(weekly))[3]).toEqual({
      type: "task",
      id: "task-9",
      notes: "do exercises 1-5",
    });
  });

  test("rowsToWeekly omits an empty note from the stored item", () => {
    const weekly: RoutineWeekly = {
      4: {
        type: "task",
        id: "task-2",
      },
    };
    const stored = rowsToWeekly(weeklyToRows(weekly))[4];
    expect(stored).toEqual({
      type: "task",
      id: "task-2",
    });
    expect(stored).not.toHaveProperty("notes");
  });

  test("a weekly grid survives a rows round-trip with notes intact", () => {
    const original: RoutineWeekly = {
      1: {
        type: "task",
        id: "task-1",
        notes: "warm up",
      },
      5: {
        type: "freeform",
        id: "Read a chapter",
        notes: "",
      },
    };
    const restored = rowsToWeekly(weeklyToRows(original));
    expect(restored[1]).toEqual({
      type: "task",
      id: "task-1",
      notes: "warm up",
    });
    // The empty note is dropped, the freeform item is otherwise intact.
    expect(restored[5]).toEqual({
      type: "freeform",
      id: "Read a chapter",
    });
  });
});

describe("weekly schedule prepend/append text", () => {
  test("weeklyToRows surfaces an item's prepend/append text", () => {
    const weekly: RoutineWeekly = {
      1: {
        type: "task",
        id: "task-1",
        prependText: "Review",
        appendText: "for 10 minutes",
      },
    };
    const monday = weeklyToRows(weekly).find(r => r.day === "1");
    expect(monday?.prependText).toBe("Review");
    expect(monday?.appendText).toBe("for 10 minutes");
  });

  test("weeklyToRows defaults missing prepend/append to empty strings", () => {
    const weekly: RoutineWeekly = {
      2: {
        type: "task",
        id: "task-1",
      },
    };
    const tuesday = weeklyToRows(weekly).find(r => r.day === "2");
    expect(tuesday?.prependText).toBe("");
    expect(tuesday?.appendText).toBe("");
  });

  test("rowsToWeekly preserves non-empty prepend/append and omits empty ones", () => {
    const original: RoutineWeekly = {
      3: {
        type: "task",
        id: "task-9",
        prependText: "Review",
        appendText: "for 10 minutes",
      },
      4: {
        type: "task",
        id: "task-2",
      },
    };
    const restored = rowsToWeekly(weeklyToRows(original));
    expect(restored[3]).toEqual({
      type: "task",
      id: "task-9",
      prependText: "Review",
      appendText: "for 10 minutes",
    });
    expect(restored[4]).not.toHaveProperty("prependText");
    expect(restored[4]).not.toHaveProperty("appendText");
  });
});

describe("weekly schedule item location", () => {
  test("weeklyToRows surfaces an item's location", () => {
    const weekly: RoutineWeekly = {
      1: {
        type: "task",
        id: "task-1",
        location: "the gym",
      },
    };
    const monday = weeklyToRows(weekly).find(r => r.day === "1");
    expect(monday?.location).toBe("the gym");
  });

  test("weeklyToRows defaults a missing location to an empty string", () => {
    const weekly: RoutineWeekly = {
      2: {
        type: "task",
        id: "task-1",
      },
    };
    const tuesday = weeklyToRows(weekly).find(r => r.day === "2");
    expect(tuesday?.location).toBe("");
  });

  test("rowsToWeekly preserves a non-empty location and omits an empty one", () => {
    const original: RoutineWeekly = {
      3: {
        type: "task",
        id: "task-9",
        location: "https://example.com/app",
      },
      4: {
        type: "task",
        id: "task-2",
      },
    };
    const restored = rowsToWeekly(weeklyToRows(original));
    expect(restored[3]).toEqual({
      type: "task",
      id: "task-9",
      location: "https://example.com/app",
    });
    expect(restored[4]).not.toHaveProperty("location");
  });
});

describe("representativeRow (Daily Task mode)", () => {
  // Regression: picking a type clears the id, so the editor must still surface
  // the chosen type before an item is picked — otherwise the controlled type
  // <select> reverts to "None" and the item picker can never be enabled.
  test("surfaces a type chosen before its item (empty id)", () => {
    const rows = fillAllDays({
      type: "task",
      id: "",
    });
    expect(representativeRow(rows)).toEqual({
      type: "task",
      id: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
      title: "",
      url: "",
      sectionId: "",
      sectionLabel: "",
    });
  });

  test("surfaces a fully populated entry", () => {
    const rows = fillAllDays({
      type: "task",
      id: "task-1",
      notes: "chapter 3",
      location: "the gym",
      prependText: "Review",
      appendText: "for 10 minutes",
    });
    expect(representativeRow(rows)).toEqual({
      type: "task",
      id: "task-1",
      notes: "chapter 3",
      location: "the gym",
      prependText: "Review",
      appendText: "for 10 minutes",
      title: "",
      url: "",
      sectionId: "",
      sectionLabel: "",
    });
  });

  test("returns a blank entry for an empty grid", () => {
    expect(representativeRow(weeklyToRows(undefined))).toEqual({
      type: "",
      id: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
      title: "",
      url: "",
      sectionId: "",
      sectionLabel: "",
    });
  });
});

describe("curated schedule helpers", () => {
  test("curatedDateRange returns an inclusive UTC range", () => {
    expect(curatedDateRange("2026-06-14", "2026-06-16")).toEqual([
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
    ]);
  });

  test("curatedDateRange caps the range at 14 days past the start", () => {
    const keys = curatedDateRange("2026-06-01", "2026-07-01");
    expect(keys[0]).toBe("2026-06-01");
    // 14 days past June 1 is June 15; anything later is clamped away.
    expect(keys.at(-1)).toBe("2026-06-15");
    expect(keys).toHaveLength(15);
  });

  test("curatedDateRange is empty without an end date or for an earlier end", () => {
    expect(curatedDateRange("2026-06-14", null)).toEqual([]);
    expect(curatedDateRange("2026-06-14", "2026-06-13")).toEqual([]);
  });

  test("curatedToRows defaults each date from the stored entries", () => {
    const curated: RoutineCurated = {
      endDate: "2026-06-15",
      entries: {
        "2026-06-15": {
          type: "task",
          id: "task-1",
          prependText: "Read",
        },
      },
    };
    const rows = curatedToRows(curated, ["2026-06-14", "2026-06-15"]);
    expect(rows[0]).toEqual({
      date: "2026-06-14",
      type: "",
      id: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
      title: "",
      url: "",
      sectionId: "",
      sectionLabel: "",
    });
    expect(rows[1]).toMatchObject({
      date: "2026-06-15",
      type: "task",
      id: "task-1",
      prependText: "Read",
    });
  });

  test("rowsToCurated drops incomplete rows and keeps the end date", () => {
    const rows = curatedToRows(null, ["2026-06-14", "2026-06-15"]);
    rows[1] = {
      ...rows[1],
      type: "task",
      id: "task-9",
      appendText: "for 20 minutes",
    };
    const curated = rowsToCurated(rows, "2026-06-15");
    expect(curated.endDate).toBe("2026-06-15");
    // The blank 06-14 row is dropped; the populated 06-15 row is kept.
    expect(curated.entries["2026-06-14"]).toBeUndefined();
    expect(curated.entries["2026-06-15"]).toEqual({
      type: "task",
      id: "task-9",
      appendText: "for 20 minutes",
    });
  });

  test("a curated grid survives a rows round-trip", () => {
    const original: RoutineCurated = {
      endDate: "2026-06-16",
      entries: {
        "2026-06-15": {
          type: "task",
          id: "task-1",
          notes: "warm up",
        },
        "2026-06-16": {
          type: "freeform",
          id: "Stretch",
        },
      },
    };
    const keys = curatedDateRange("2026-06-14", original.endDate);
    const restored = rowsToCurated(
      curatedToRows(original, keys),
      original.endDate,
    );
    expect(restored.entries["2026-06-15"]).toEqual({
      type: "task",
      id: "task-1",
      notes: "warm up",
    });
    expect(restored.entries["2026-06-16"]).toEqual({
      type: "freeform",
      id: "Stretch",
    });
  });
});
