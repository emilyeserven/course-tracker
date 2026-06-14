import { describe, expect, test } from "vitest";

import { makePercentageComplete } from "./makePercentageComplete.ts";

describe("makePercentageComplete", () => {
  test("returns the percentage fixed to two decimals", () => {
    expect(makePercentageComplete(1, 4)).toBe("25.00");
    expect(makePercentageComplete(1, 3)).toBe("33.33");
    expect(makePercentageComplete(4, 4)).toBe("100.00");
  });

  test("returns undefined when current is missing or zero", () => {
    expect(makePercentageComplete(undefined, 4)).toBeUndefined();
    expect(makePercentageComplete(0, 4)).toBeUndefined();
  });

  test("returns undefined when total is missing or zero", () => {
    expect(makePercentageComplete(2, undefined)).toBeUndefined();
    expect(makePercentageComplete(2, 0)).toBeUndefined();
  });
});
