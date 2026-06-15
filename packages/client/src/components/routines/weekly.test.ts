import type { RoutineCurated, RoutineWeekly } from "@emstack/types";

import { describe, expect, test } from "vitest";

import type { WeeklyRow } from "./weekly";
import type { SelectOption } from "@/utils";

import {
  curatedDateRange,
  curatedToRows,
  effectiveEntryUrl,
  fillAllDays,
  fillEffectiveLocations,
  representativeRow,
  rowsToCurated,
  rowsToWeekly,
  weeklyEntryName,
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
        type: "resource",
        id: "res-1",
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
        type: "resource",
        id: "res-1",
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
        type: "resource",
        id: "res-1",
      },
    };
    const tuesday = weeklyToRows(weekly).find(r => r.day === "2");
    expect(tuesday?.prependText).toBe("");
    expect(tuesday?.appendText).toBe("");
  });

  test("rowsToWeekly preserves non-empty prepend/append and omits empty ones", () => {
    const original: RoutineWeekly = {
      3: {
        type: "resource",
        id: "res-9",
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
      type: "resource",
      id: "res-9",
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
        type: "resource",
        id: "res-1",
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
      moduleId: "",
      moduleGroupId: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
    });
  });

  test("surfaces a fully populated entry", () => {
    const rows = fillAllDays({
      type: "resource",
      id: "res-1",
      notes: "chapter 3",
      location: "the gym",
      prependText: "Review",
      appendText: "for 10 minutes",
    });
    expect(representativeRow(rows)).toEqual({
      type: "resource",
      id: "res-1",
      moduleId: "",
      moduleGroupId: "",
      notes: "chapter 3",
      location: "the gym",
      prependText: "Review",
      appendText: "for 10 minutes",
    });
  });

  test("returns a blank entry for an empty grid", () => {
    expect(representativeRow(weeklyToRows(undefined))).toEqual({
      type: "",
      id: "",
      moduleId: "",
      moduleGroupId: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
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
      moduleId: "",
      moduleGroupId: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
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
      type: "resource",
      id: "res-9",
      appendText: "for 20 minutes",
    };
    const curated = rowsToCurated(rows, "2026-06-15");
    expect(curated.endDate).toBe("2026-06-15");
    // The blank 06-14 row is dropped; the populated 06-15 row is kept.
    expect(curated.entries["2026-06-14"]).toBeUndefined();
    expect(curated.entries["2026-06-15"]).toEqual({
      type: "resource",
      id: "res-9",
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
    const restored = rowsToCurated(curatedToRows(original, keys), original.endDate);
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

describe("resource entry module narrowing", () => {
  test("weeklyToRows surfaces a resource entry's module / group ids", () => {
    const weekly: RoutineWeekly = {
      1: {
        type: "resource",
        id: "res-1",
        moduleId: "mod-1",
      },
      2: {
        type: "resource",
        id: "res-2",
        moduleGroupId: "grp-1",
      },
    };
    const rows = weeklyToRows(weekly);
    expect(rows.find(r => r.day === "1")).toMatchObject({
      moduleId: "mod-1",
      moduleGroupId: "",
    });
    expect(rows.find(r => r.day === "2")).toMatchObject({
      moduleId: "",
      moduleGroupId: "grp-1",
    });
  });

  test("rowsToWeekly persists a resource module but omits empty narrowing", () => {
    const withModule = rowsToWeekly(
      weeklyToRows({
        1: {
          type: "resource",
          id: "res-1",
          moduleId: "mod-1",
        },
      }),
    );
    expect(withModule[1]).toEqual({
      type: "resource",
      id: "res-1",
      moduleId: "mod-1",
    });

    const plainResource = rowsToWeekly(
      weeklyToRows({
        2: {
          type: "resource",
          id: "res-2",
        },
      }),
    );
    expect(plainResource[2]).not.toHaveProperty("moduleId");
    expect(plainResource[2]).not.toHaveProperty("moduleGroupId");
  });

  test("rowsToWeekly never persists module narrowing on a task entry", () => {
    // moduleId would only ever land on a row through a resource selection, but
    // guard the invariant that task entries stay module-free.
    const rows = weeklyToRows({
      3: {
        type: "task",
        id: "task-1",
      },
    });
    const tweaked = rows.map(r =>
      r.day === "3"
        ? {
          ...r,
          moduleId: "mod-9",
        }
        : r);
    expect(rowsToWeekly(tweaked)[3]).not.toHaveProperty("moduleId");
  });

  test("weeklyEntryName shows the module name in place of the resource", () => {
    const resourceNames = new Map([["res-1", "Duolingo Spanish"]]);
    const moduleNames = new Map([["mod-1", "Basics 1"]]);
    const moduleGroupNames = new Map([["grp-1", "Unit 1"]]);

    expect(
      weeklyEntryName(
        {
          type: "resource",
          id: "res-1",
          moduleId: "mod-1",
        },
        new Map(),
        resourceNames,
        moduleNames,
        moduleGroupNames,
      ),
    ).toBe("Basics 1");

    expect(
      weeklyEntryName(
        {
          type: "resource",
          id: "res-1",
          moduleGroupId: "grp-1",
        },
        new Map(),
        resourceNames,
        moduleNames,
        moduleGroupNames,
      ),
    ).toBe("Unit 1");

    // No narrowing → the resource name stands.
    expect(
      weeklyEntryName(
        {
          type: "resource",
          id: "res-1",
        },
        new Map(),
        resourceNames,
        moduleNames,
        moduleGroupNames,
      ),
    ).toBe("Duolingo Spanish");
  });
});

describe("effectiveEntryUrl", () => {
  const resourceOptions: SelectOption[] = [
    {
      value: "res-1",
      label: "Duolingo",
      url: "https://duolingo.com",
    },
    {
      value: "res-2",
      label: "Some Book",
    },
  ];
  const groupOptions: SelectOption[] = [
    {
      value: "grp-1",
      label: "Unit 1",
      group: "",
      url: "https://example.com/unit-1",
    },
    {
      value: "grp-2",
      label: "Unit 2",
      group: "",
    },
  ];
  const moduleOptions: SelectOption[] = [
    {
      value: "mod-1",
      label: "Lesson 1",
      group: "grp-1",
      url: "https://example.com/lesson-1",
    },
    {
      value: "mod-2",
      label: "Lesson 2",
      group: "grp-1",
    },
  ];

  test("returns the resource's url for a whole-resource entry", () => {
    expect(
      effectiveEntryUrl(
        {
          type: "resource",
          id: "res-1",
          moduleId: "",
          moduleGroupId: "",
        },
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    ).toBe("https://duolingo.com");
  });

  test("a chosen module's url wins over its group and resource", () => {
    expect(
      effectiveEntryUrl(
        {
          type: "resource",
          id: "res-1",
          moduleId: "mod-1",
          moduleGroupId: "",
        },
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    ).toBe("https://example.com/lesson-1");
  });

  test("falls back to the module's group url when the module has none", () => {
    expect(
      effectiveEntryUrl(
        {
          type: "resource",
          id: "res-1",
          // mod-2 has no url but belongs to grp-1, which does.
          moduleId: "mod-2",
          moduleGroupId: "",
        },
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    ).toBe("https://example.com/unit-1");
  });

  test("uses an explicitly chosen group's url", () => {
    expect(
      effectiveEntryUrl(
        {
          type: "resource",
          id: "res-1",
          moduleId: "",
          moduleGroupId: "grp-1",
        },
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    ).toBe("https://example.com/unit-1");
  });

  test("falls back to the resource url when the chosen group has none", () => {
    expect(
      effectiveEntryUrl(
        {
          type: "resource",
          id: "res-1",
          moduleId: "",
          moduleGroupId: "grp-2",
        },
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    ).toBe("https://duolingo.com");
  });

  test("returns '' when nothing in the chain has a link", () => {
    expect(
      effectiveEntryUrl(
        {
          type: "resource",
          id: "res-2",
          moduleId: "",
          moduleGroupId: "",
        },
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    ).toBe("");
  });

  test("returns '' for task / freeform entries even if ids collide", () => {
    expect(
      effectiveEntryUrl(
        {
          type: "task",
          id: "res-1",
          moduleId: "",
          moduleGroupId: "",
        },
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    ).toBe("");
    expect(
      effectiveEntryUrl(
        {
          type: "freeform",
          id: "res-1",
          moduleId: "",
          moduleGroupId: "",
        },
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    ).toBe("");
  });
});

describe("fillEffectiveLocations", () => {
  const resourceOptions: SelectOption[] = [
    {
      value: "res-1",
      label: "Duolingo",
      url: "https://duolingo.com",
    },
    {
      value: "res-2",
      label: "Some Book",
    },
  ];
  // res-1 narrows to grp-1 (which carries a url) and mod-1 (which also does).
  const moduleGroupsByResource = new Map<string, SelectOption[]>([
    [
      "res-1",
      [
        {
          value: "grp-1",
          label: "Unit 1",
          group: "",
          url: "https://example.com/unit-1",
        },
      ],
    ],
  ]);
  const modulesByResource = new Map<string, SelectOption[]>([
    [
      "res-1",
      [
        {
          value: "mod-1",
          label: "Lesson 1",
          group: "grp-1",
          url: "https://example.com/lesson-1",
        },
      ],
    ],
  ]);

  // A full weekly row with overridable fields; defaults to a blank-location
  // whole-resource entry on res-1.
  function row(over: Partial<WeeklyRow> = {}): WeeklyRow {
    return {
      day: "1",
      type: "resource",
      id: "res-1",
      moduleId: "",
      moduleGroupId: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
      ...over,
    };
  }

  const fill = (rows: WeeklyRow[]) =>
    fillEffectiveLocations(
      rows,
      resourceOptions,
      moduleGroupsByResource,
      modulesByResource,
    );

  test("fills a blank location from the resource's url", () => {
    expect(fill([row()])[0].location).toBe("https://duolingo.com");
  });

  test("fills from the most-specific narrowing (module > group)", () => {
    expect(fill([row({
      moduleGroupId: "grp-1",
    })])[0].location).toBe(
      "https://example.com/unit-1",
    );
    expect(fill([row({
      moduleId: "mod-1",
    })])[0].location).toBe(
      "https://example.com/lesson-1",
    );
  });

  test("leaves a user-typed location untouched", () => {
    expect(fill([row({
      location: "my own note",
    })])[0].location).toBe(
      "my own note",
    );
  });

  test("leaves the location blank when nothing in the chain has a link", () => {
    expect(fill([row({
      id: "res-2",
    })])[0].location).toBe("");
  });

  test("ignores task / freeform entries", () => {
    expect(fill([row({
      type: "task",
      id: "res-1",
    })])[0].location).toBe("");
    expect(fill([row({
      type: "freeform",
      id: "res-1",
    })])[0].location).toBe("");
  });

  test("preserves the row's other fields (e.g. its day key)", () => {
    const [filled] = fill([row({
      day: "3",
      notes: "hi",
    })]);
    expect(filled.day).toBe("3");
    expect(filled.notes).toBe("hi");
    expect(filled.location).toBe("https://duolingo.com");
  });
});
