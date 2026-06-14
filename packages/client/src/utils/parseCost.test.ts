import { describe, expect, test } from "vitest";

import { parseCost } from "./parseCost.ts";

describe("parseCost", () => {
  test("parses numeric strings", () => {
    expect(parseCost("12")).toBe(12);
    expect(parseCost("12.50")).toBe(12.5);
    expect(parseCost("-3")).toBe(-3);
  });

  test("defaults to 0 for null, undefined and empty string", () => {
    expect(parseCost(null)).toBe(0);
    expect(parseCost(undefined)).toBe(0);
    expect(parseCost("")).toBe(0);
  });

  test("defaults to 0 for non-finite or non-numeric input", () => {
    expect(parseCost("abc")).toBe(0);
    expect(parseCost("Infinity")).toBe(0);
    expect(parseCost("NaN")).toBe(0);
  });
});
