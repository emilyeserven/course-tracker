import { describe, expect, test } from "vitest";

import { formatCurrency } from "./formatCurrency.ts";

describe("formatCurrency", () => {
  test("formats a whole number as USD", () => {
    expect(formatCurrency(10)).toBe("$10.00");
  });

  test("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  test("rounds to two decimal places", () => {
    expect(formatCurrency(9.999)).toBe("$10.00");
    expect(formatCurrency(1.5)).toBe("$1.50");
  });

  test("groups thousands with a comma", () => {
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });

  test("formats negative values", () => {
    expect(formatCurrency(-42.5)).toBe("-$42.50");
  });
});
