import type { Module } from "@emstack/types";

import { describe, expect, test } from "vitest";

import { draftToLength, moduleToDraft, parseCount } from "./moduleDrafts";

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
