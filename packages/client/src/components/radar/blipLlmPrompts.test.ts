import type { RadarQuadrant, RadarRing } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  buildCleanupPrompt,
  buildLlmPrompt,
  describeProgress,
  formatExcludedTopics,
  formatTopicNameList,
  formatTopicsWithCourses,
} from "./blipLlmPrompts";

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

describe("describeProgress", () => {
  test("formats current/total with a percentage", () => {
    expect(describeProgress({
      progressCurrent: 3,
      progressTotal: 10,
    })).toBe(" — 3/10 (30%)");
  });

  test("formats a bare current count when there is no total", () => {
    expect(describeProgress({
      progressCurrent: 4,
    })).toBe(" — 4 done");
  });

  test("appends the status when present", () => {
    expect(describeProgress({
      progressCurrent: 3,
      progressTotal: 10,
      status: "active",
    })).toBe(" — 3/10 (30%), active");
  });

  test("returns an empty string when there is nothing to say", () => {
    expect(describeProgress({})).toBe("");
  });
});

describe("formatTopicsWithCourses", () => {
  test("lists topics with their courses and progress", () => {
    const out = formatTopicsWithCourses([
      {
        id: "t1",
        name: "TypeScript",
        courses: [
          {
            id: "c1",
            name: "TS Deep Dive",
            progressCurrent: 5,
            progressTotal: 10,
          },
        ],
      },
      {
        id: "t2",
        name: "Rust",
      },
    ]);
    expect(out).toContain("- TypeScript");
    expect(out).toContain("  - TS Deep Dive — 5/10 (50%)");
    expect(out).toContain("- Rust");
    expect(out).toContain("  - (no courses)");
  });

  test("falls back to a placeholder when there are no topics", () => {
    expect(formatTopicsWithCourses([])).toBe(
      "- (no topics linked to this domain yet)",
    );
  });
});

describe("formatExcludedTopics", () => {
  test("includes the reason when present", () => {
    const out = formatExcludedTopics([
      {
        id: "e1",
        name: "PHP",
        reason: "not interested",
      },
      {
        id: "e2",
        name: "Perl",
      },
    ]);
    expect(out).toContain("- PHP — not interested");
    expect(out).toContain("- Perl");
  });

  test("falls back to (none) when empty", () => {
    expect(formatExcludedTopics([])).toBe("- (none)");
  });
});

describe("formatTopicNameList", () => {
  test("formats names as a bullet list", () => {
    expect(formatTopicNameList(["A", "B"])).toBe("- A\n- B");
  });

  test("falls back to (none) for undefined or empty input", () => {
    expect(formatTopicNameList(undefined)).toBe("- (none)");
    expect(formatTopicNameList([])).toBe("- (none)");
  });
});

describe("buildLlmPrompt", () => {
  const baseArgs = {
    domainTitle: "Web Development",
    domainDescription: "Everything front-end and back-end.",
    domainTopics: [
      {
        id: "t1",
        name: "React",
        courses: [
          {
            id: "c1",
            name: "React Basics",
            progressCurrent: 2,
            progressTotal: 8,
          },
        ],
      },
    ],
    excludedTopics: [
      {
        id: "e1",
        name: "jQuery",
        reason: "legacy",
      },
    ],
    withinScopeTopicNames: ["React", "Vite"],
    outOfScopeTopicNames: ["Cooking"],
    quadrants,
    rings,
    existingBlips: [
      {
        topicName: "React",
        radarNote: "core framework",
        topicDescription: "A UI library",
        currentSliceName: "Languages",
        currentRingName: "Adopt",
      },
    ],
  };

  test("contains the domain title, slices, and rings", () => {
    const prompt = buildLlmPrompt(baseArgs);
    expect(prompt).toContain("\"Web Development\" domain");
    expect(prompt).toContain("- Languages");
    expect(prompt).toContain("- Tools");
    expect(prompt).toContain("- Adopt");
    expect(prompt).toContain("- Trial");
  });

  test("contains the topic, scope, and excluded names passed in", () => {
    const prompt = buildLlmPrompt(baseArgs);
    expect(prompt).toContain("- React");
    expect(prompt).toContain("React Basics — 2/8 (25%)");
    expect(prompt).toContain("- jQuery — legacy");
    expect(prompt).toContain("- Vite");
    expect(prompt).toContain("- Cooking");
  });

  test("describes existing blips with placement and notes", () => {
    const prompt = buildLlmPrompt(baseArgs);
    expect(prompt).toContain("current placement: Languages / Adopt");
    expect(prompt).toContain("general description: A UI library");
    expect(prompt).toContain("radar note: core framework");
  });

  test("explains the adopted ring when one exists", () => {
    const prompt = buildLlmPrompt(baseArgs);
    expect(prompt).toContain("The \"Adopt\" ring is for topics");
  });

  test("documents the add/update/remove action contract", () => {
    const prompt = buildLlmPrompt(baseArgs);
    expect(prompt).toContain("\"add\"");
    expect(prompt).toContain("\"update\"");
    expect(prompt).toContain("\"remove\"");
    expect(prompt).toContain("no change");
  });

  test("uses placeholders when optional context is missing", () => {
    const prompt = buildLlmPrompt({
      ...baseArgs,
      domainDescription: null,
      domainTopics: [],
      excludedTopics: [],
      withinScopeTopicNames: [],
      outOfScopeTopicNames: [],
      existingBlips: [],
    });
    expect(prompt).toContain("(no description provided)");
    expect(prompt).toContain("- (no topics linked to this domain yet)");
    expect(prompt).toContain("- (none yet)");
    expect(prompt).toContain("- (none)");
  });
});

describe("buildCleanupPrompt", () => {
  const baseArgs = {
    domainTitle: "Web Development",
    domainDescription: "Everything web.",
    quadrants,
    rings,
    unassignedBlips: [
      {
        topicName: "Svelte",
        quadrantName: null,
        ringName: "Trial",
        radarNote: "evaluating",
        topicDescription: "A compiler framework",
      },
    ],
  };

  test("frames the task as cleanup rather than setup", () => {
    const prompt = buildCleanupPrompt(baseArgs);
    expect(prompt).toContain("cleaning up");
    expect(prompt).toContain("\"Web Development\" tech radar");
    expect(prompt).not.toContain("Please suggest topics relevant");
  });

  test("lists each unassigned blip with its status", () => {
    const prompt = buildCleanupPrompt(baseArgs);
    expect(prompt).toContain("- Svelte");
    expect(prompt).toContain("description: A compiler framework");
    expect(prompt).toContain("radar note: evaluating");
    expect(prompt).toContain("missing slice");
    expect(prompt).toContain("current ring: Trial");
  });

  test("requires the update action for every entry", () => {
    const prompt = buildCleanupPrompt(baseArgs);
    expect(prompt).toContain("\"action\": \"update\"");
    expect(prompt).toContain("The \"action\" field must be");
  });

  test("falls back to a placeholder when nothing is unassigned", () => {
    const prompt = buildCleanupPrompt({
      ...baseArgs,
      unassignedBlips: [],
    });
    expect(prompt).toContain(
      "- (none — all blips already have slice and ring assigned)",
    );
  });
});
