import type { Module, ModuleGroup, TagGroup } from "@emstack/types";

import { describe, expect, test } from "vitest";

import { NEW_ROW_ID } from "@/constants/sentinels";
import {
  draftToLength,
  emptyGroupDraft,
  emptyModuleDraft,
  groupToDraft,
  levelChipClass,
  lookupTagsByIds,
  moduleToDraft,
  parseCount,
} from "./moduleDrafts";

const baseModule: Module = {
  id: "mod-1",
  resourceId: "res-1",
  name: "Intro",
  isComplete: false,
};

describe("moduleToDraft / draftToLength round-trip", () => {
  test("an exact-minutes length round-trips", () => {
    const draft = moduleToDraft({
      ...baseModule,
      length: "30",
    });
    expect(draft.durationMode).toBe("minutes");
    expect(draft.minutesValue).toBe("30");
    expect(draft.bucketValue).toBe("");
    expect(draftToLength(draft)).toBe("30");
  });

  test("a duration-bucket length round-trips", () => {
    const draft = moduleToDraft({
      ...baseModule,
      length: "short",
    });
    expect(draft.durationMode).toBe("bucket");
    expect(draft.bucketValue).toBe("short");
    expect(draft.minutesValue).toBe("");
    expect(draftToLength(draft)).toBe("short");
  });

  test("an empty length round-trips to null", () => {
    const draft = moduleToDraft({
      ...baseModule,
      length: null,
    });
    expect(draft.durationMode).toBe("minutes");
    expect(draft.minutesValue).toBe("");
    expect(draft.bucketValue).toBe("");
    expect(draftToLength(draft)).toBeNull();
  });

  test("a bucket draft with no bucket selected yields null", () => {
    const draft = moduleToDraft({
      ...baseModule,
      length: null,
    });
    draft.durationMode = "bucket";
    expect(draftToLength(draft)).toBeNull();
  });
});

describe("parseCount", () => {
  test("an empty string returns null", () => {
    expect(parseCount("")).toBeNull();
  });

  test("a non-numeric string returns null", () => {
    expect(parseCount("abc")).toBeNull();
  });

  test("a negative number returns null", () => {
    expect(parseCount("-3")).toBeNull();
  });

  test("a valid integer string parses", () => {
    expect(parseCount("12")).toBe(12);
  });

  test("a decimal is floored to an integer", () => {
    expect(parseCount("3.7")).toBe(3);
  });
});

describe("emptyGroupDraft", () => {
  test("creates a blank group draft with the new-id sentinel", () => {
    const draft = emptyGroupDraft();
    expect(draft.id).toBe(NEW_ROW_ID);
    expect(draft.name).toBe("");
    expect(draft.totalCount).toBe("");
    expect(draft.completedCount).toBe("");
    expect(draft.pageStart).toBe("");
    expect(draft.pageEnd).toBe("");
    expect(draft.easeOfStarting).toBe("");
    expect(draft.tagIds).toEqual([]);
  });
});

describe("groupToDraft", () => {
  test("stringifies counts and carries levels and tag ids", () => {
    const group: ModuleGroup = {
      id: "g-1",
      resourceId: "res-1",
      name: "Group",
      description: "desc",
      url: "https://example.com",
      pageStart: 42,
      pageEnd: 58,
      totalCount: 10,
      completedCount: 4,
      easeOfStarting: "high",
      timeNeeded: "medium",
      interactivity: "low",
      tags: [
        {
          id: "t-1",
          groupId: "tg-1",
          name: "Tag",
        },
      ],
    };
    expect(groupToDraft(group)).toEqual({
      id: "g-1",
      name: "Group",
      description: "desc",
      url: "https://example.com",
      pageStart: "42",
      pageEnd: "58",
      totalCount: "10",
      completedCount: "4",
      easeOfStarting: "high",
      timeNeeded: "medium",
      interactivity: "low",
      tagIds: ["t-1"],
    });
  });

  test("falls back to empty strings/arrays for absent fields", () => {
    const group: ModuleGroup = {
      id: "g-2",
      resourceId: "res-1",
      name: "Bare",
    };
    const draft = groupToDraft(group);
    expect(draft.description).toBe("");
    expect(draft.url).toBe("");
    expect(draft.totalCount).toBe("");
    expect(draft.completedCount).toBe("");
    expect(draft.pageStart).toBe("");
    expect(draft.pageEnd).toBe("");
    expect(draft.easeOfStarting).toBe("");
    expect(draft.tagIds).toEqual([]);
  });
});

describe("emptyModuleDraft", () => {
  test("creates a blank module draft defaulting to minutes mode", () => {
    const draft = emptyModuleDraft();
    expect(draft.id).toBe(NEW_ROW_ID);
    expect(draft.durationMode).toBe("minutes");
    expect(draft.minutesValue).toBe("");
    expect(draft.bucketValue).toBe("");
    expect(draft.pageStart).toBe("");
    expect(draft.pageEnd).toBe("");
    expect(draft.tagIds).toEqual([]);
  });

  test("stringifies a module's page range", () => {
    const draft = moduleToDraft({
      ...baseModule,
      pageStart: 12,
      pageEnd: 20,
    });
    expect(draft.pageStart).toBe("12");
    expect(draft.pageEnd).toBe("20");
  });
});

describe("levelChipClass", () => {
  test("returns a distinct class per known level", () => {
    expect(levelChipClass("low")).toContain("emerald");
    expect(levelChipClass("medium")).toContain("amber");
    expect(levelChipClass("high")).toContain("rose");
  });

  test("returns the muted fallback for an absent level", () => {
    expect(levelChipClass(null)).toContain("muted");
    expect(levelChipClass(undefined)).toContain("muted");
  });
});

describe("lookupTagsByIds", () => {
  const tagGroups: TagGroup[] = [
    {
      id: "tg-1",
      name: "Group 1",
      tags: [
        {
          id: "t-1",
          groupId: "tg-1",
          name: "One",
        },
        {
          id: "t-2",
          groupId: "tg-1",
          name: "Two",
        },
      ],
    },
    {
      id: "tg-2",
      name: "Group 2",
      tags: [
        {
          id: "t-3",
          groupId: "tg-2",
          name: "Three",
        },
      ],
    },
  ];

  test("resolves ids to tags in request order across groups", () => {
    expect(
      lookupTagsByIds(["t-3", "t-1"], tagGroups).map(t => t.name),
    ).toEqual(["Three", "One"]);
  });

  test("silently drops unknown ids", () => {
    expect(
      lookupTagsByIds(["t-1", "missing"], tagGroups).map(t => t.id),
    ).toEqual(["t-1"]);
  });

  test("handles groups with no tags and an empty id list", () => {
    expect(lookupTagsByIds([], tagGroups)).toEqual([]);
    expect(
      lookupTagsByIds(
        ["t-1"],
        [
          {
            id: "tg-3",
            name: "Empty",
          },
        ],
      ),
    ).toEqual([]);
  });
});
