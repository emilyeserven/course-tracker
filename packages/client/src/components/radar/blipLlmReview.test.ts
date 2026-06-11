import type {
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { describe, expect, test } from "vitest";

import type { ParseLlmLookups } from "./blipLlmReview";

import { computeProblems, parseLlmEntries } from "./blipLlmReview";

const quadrants: RadarQuadrant[] = [
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

const rings: RadarRing[] = [
  {
    id: "r1",
    name: "Adopt",
    position: 0,
    isAdopted: true,
  },
  {
    id: "r2",
    name: "Trial",
    position: 1,
  },
];

const topics: TopicForTopicsPage[] = [
  {
    id: "t1",
    name: "React",
    description: "A UI library",
    resourceCount: 2,
    taskCount: 1,
    dailyCount: 0,
  },
  {
    id: "t2",
    name: "Svelte",
    description: null,
  },
];

const existingBlips: RadarBlip[] = [
  {
    id: "b1",
    domainId: "d1",
    quadrantId: "q1",
    ringId: "r1",
    topicId: "t1",
    topicName: "React",
    description: "existing note",
  },
];

function makeLookups(overrides: Partial<ParseLlmLookups> = {}): ParseLlmLookups {
  return {
    topicByLowerName: new Map(topics.map(t => [t.name.toLowerCase(), t])),
    quadrantByLowerName: new Map(quadrants.map(q => [q.name.toLowerCase(), q])),
    ringByLowerName: new Map(rings.map(r => [r.name.toLowerCase(), r])),
    existingBlipByTopicId: new Map(existingBlips.map(b => [b.topicId, b])),
    excludedNamesLower: new Set<string>(),
    ...overrides,
  };
}

describe("parseLlmEntries", () => {
  test("parses a valid entry for a new topic", () => {
    const json = JSON.stringify([
      {
        topic: "Zig",
        action: "add",
        description: "A systems language",
        radarNote: "worth a look",
        quadrant: "Languages",
        ring: "Trial",
      },
    ]);
    const result = parseLlmEntries(json, makeLookups());
    expect(result.error).toBeNull();
    expect(result.entries).toHaveLength(1);
    const entry = result.entries![0];
    expect(entry.topicName).toBe("Zig");
    expect(entry.matchedTopicId).toBeNull();
    expect(entry.willCreateTopic).toBe(true);
    expect(entry.quadrantId).toBe("q1");
    expect(entry.ringId).toBe("r2");
    expect(entry.description).toBe("A systems language");
    expect(entry.radarNote).toBe("worth a look");
    expect(entry.resolution).toBe("create");
    expect(entry.problems).toEqual([]);
  });

  test("matches topics, slices, and rings case-insensitively", () => {
    const json = JSON.stringify([
      {
        topic: "react",
        quadrant: "LANGUAGES",
        ring: "adopt",
      },
    ]);
    const result = parseLlmEntries(json, makeLookups());
    const entry = result.entries![0];
    expect(entry.matchedTopicId).toBe("t1");
    expect(entry.willCreateTopic).toBe(false);
    expect(entry.quadrantId).toBe("q1");
    expect(entry.ringId).toBe("r1");
  });

  test("defaults an existing-blip topic to overwriteAll and carries existing state", () => {
    const json = JSON.stringify([
      {
        topic: "React",
        description: "Updated description",
        radarNote: "new note",
        quadrant: "Tools",
        ring: "Trial",
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups()).entries![0];
    expect(entry.resolution).toBe("overwriteAll");
    expect(entry.existingBlipId).toBe("b1");
    expect(entry.existingQuadrantId).toBe("q1");
    expect(entry.existingRingId).toBe("r1");
    expect(entry.existingRadarNote).toBe("existing note");
    expect(entry.existingTopicDescription).toBe("A UI library");
    expect(entry.topicCourseCount).toBe(2);
    expect(entry.topicTaskCount).toBe(1);
    expect(entry.topicDailyCount).toBe(0);
  });

  test("honors a remove action for a topic already on the radar", () => {
    const json = JSON.stringify([
      {
        topic: "React",
        action: "remove",
        radarNote: "no longer relevant",
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups()).entries![0];
    expect(entry.resolution).toBe("removeBlip");
    expect(entry.problems).toEqual([]);
  });

  test("strips a surrounding markdown code fence", () => {
    const json = `\`\`\`json\n${JSON.stringify([
      {
        topic: "Zig",
        quadrant: "Languages",
        ring: "Trial",
      },
    ])}\n\`\`\``;
    const result = parseLlmEntries(json, makeLookups());
    expect(result.error).toBeNull();
    expect(result.entries![0].topicName).toBe("Zig");
  });

  test("returns an error for malformed JSON", () => {
    const result = parseLlmEntries("not json at all", makeLookups());
    expect(result.entries).toBeNull();
    expect(result.error).toBeTruthy();
  });

  test("returns an error when the JSON is not an array", () => {
    const result = parseLlmEntries("{\"topic\": \"React\"}", makeLookups());
    expect(result.entries).toBeNull();
    expect(result.error).toBe("Expected a JSON array.");
  });

  test("the no-change sentinel keeps the existing description and note", () => {
    const json = JSON.stringify([
      {
        topic: "React",
        description: "no change",
        radarNote: "No Change",
        quadrant: "Languages",
        ring: "Adopt",
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups()).entries![0];
    expect(entry.description).toBe("A UI library");
    expect(entry.radarNote).toBe("existing note");
  });

  test("the no-change sentinel resolves to null when there is nothing to keep", () => {
    const json = JSON.stringify([
      {
        topic: "Svelte",
        description: "no change",
        radarNote: "no-change",
        quadrant: "Languages",
        ring: "Trial",
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups()).entries![0];
    expect(entry.description).toBeNull();
    expect(entry.radarNote).toBeNull();
  });

  test("null and missing fields become nulls and surface problems", () => {
    const json = JSON.stringify([
      {
        topic: "Zig",
        description: null,
        radarNote: null,
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups()).entries![0];
    expect(entry.description).toBeNull();
    expect(entry.radarNote).toBeNull();
    expect(entry.quadrantId).toBeNull();
    expect(entry.ringId).toBeNull();
    expect(entry.problems).toContain("missing slice");
    expect(entry.problems).toContain("missing ring");
  });

  test("a missing topic name is reported as a problem", () => {
    const json = JSON.stringify([
      {
        quadrant: "Languages",
        ring: "Trial",
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups()).entries![0];
    expect(entry.topicName).toBe("");
    expect(entry.problems).toContain("missing topic");
  });

  test("unknown slice and ring names are reported with their input", () => {
    const json = JSON.stringify([
      {
        topic: "Zig",
        quadrant: "Bogus",
        ring: "Nope",
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups()).entries![0];
    expect(entry.problems).toContain("unknown slice \"Bogus\"");
    expect(entry.problems).toContain("unknown ring \"Nope\"");
  });

  test("an excluded topic is skipped and flagged", () => {
    const json = JSON.stringify([
      {
        topic: "jQuery",
        quadrant: "Languages",
        ring: "Trial",
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups({
      excludedNamesLower: new Set(["jquery"]),
    })).entries![0];
    expect(entry.resolution).toBe("skip");
    expect(entry.problems).toContain("topic is excluded from this radar");
  });

  test("rows start unselected and not editing", () => {
    const json = JSON.stringify([
      {
        topic: "Zig",
        quadrant: "Languages",
        ring: "Trial",
      },
    ]);
    const entry = parseLlmEntries(json, makeLookups()).entries![0];
    expect(entry.selected).toBe(false);
    expect(entry.editing).toBe(false);
    expect(entry.editDraft).toBeNull();
    expect(entry.deleteTopicOnRemove).toBe(false);
  });
});

describe("computeProblems", () => {
  const base = {
    topicName: "React",
    quadrantInput: "Languages",
    quadrantId: "q1",
    ringInput: "Trial",
    ringId: "r2",
    resolution: "create" as const,
    existingBlipId: null,
  };

  test("create with a valid slice and ring has no problems", () => {
    expect(computeProblems(base)).toEqual([]);
  });

  test("create flags missing or unknown slice and ring", () => {
    expect(computeProblems({
      ...base,
      quadrantInput: "",
      quadrantId: null,
      ringInput: "Nope",
      ringId: null,
    })).toEqual(["missing slice", "unknown ring \"Nope\""]);
  });

  test("overwriteAll without a matched slice flags the input name", () => {
    expect(computeProblems({
      ...base,
      resolution: "overwriteAll",
      existingBlipId: "b1",
      quadrantInput: "Bogus",
      quadrantId: null,
    })).toEqual(["unknown slice \"Bogus\""]);
  });

  test("skip only validates the topic itself", () => {
    expect(computeProblems({
      ...base,
      resolution: "skip",
      quadrantId: null,
      ringId: null,
    })).toEqual([]);
    expect(computeProblems({
      ...base,
      resolution: "skip",
      topicName: "",
    })).toEqual(["missing topic"]);
  });

  test("removeBlip requires an existing blip but no placement", () => {
    expect(computeProblems({
      ...base,
      resolution: "removeBlip",
      existingBlipId: "b1",
      quadrantId: null,
      ringId: null,
    })).toEqual([]);
    expect(computeProblems({
      ...base,
      resolution: "removeBlip",
      existingBlipId: null,
    })).toEqual(["no existing blip to remove"]);
  });

  test("updateBlip requires an existing blip but no placement", () => {
    expect(computeProblems({
      ...base,
      resolution: "updateBlip",
      existingBlipId: "b1",
      quadrantId: null,
      ringId: null,
    })).toEqual([]);
    expect(computeProblems({
      ...base,
      resolution: "updateBlip",
      existingBlipId: null,
    })).toEqual(["no existing blip to update"]);
  });

  test("flags an excluded topic regardless of resolution", () => {
    expect(computeProblems(base, new Set(["react"]))).toEqual([
      "topic is excluded from this radar",
    ]);
  });
});
