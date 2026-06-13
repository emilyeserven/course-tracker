import { describe, expect, test } from "vitest";

import { formHasChanges } from "./formHasChanges.ts";

describe("formHasChanges", () => {
  test("returns false for scalars that are equal by value", () => {
    expect(
      formHasChanges(
        {
          name: "Read",
          count: 3,
          done: false,
          note: null,
        },
        {
          name: "Read",
          count: 3,
          done: false,
          note: null,
        },
      ),
    ).toBe(false);
  });

  test("returns true when a scalar changes", () => {
    expect(formHasChanges({
      name: "b",
    }, {
      name: "a",
    })).toBe(true);
    expect(formHasChanges({
      count: 4,
    }, {
      count: 3,
    })).toBe(true);
    expect(formHasChanges({
      done: true,
    }, {
      done: false,
    })).toBe(true);
  });

  // The core regression: a refetch produces new array references with equal
  // content. Reference comparison would flag this as "changed"; value
  // comparison must not.
  test("equal-content arrays from distinct references are not changes", () => {
    const weeklyRows = () => [
      {
        day: "0",
        type: "",
        id: "",
      },
      {
        day: "1",
        type: "task",
        id: "t-1",
        notes: "",
      },
    ];
    expect(
      formHasChanges(
        {
          connections: ["topic:a", "task:b"],
          weekly: weeklyRows(),
        },
        {
          connections: ["topic:a", "task:b"],
          weekly: weeklyRows(),
        },
      ),
    ).toBe(false);
  });

  test("returns true for changed, reordered, or different-length arrays", () => {
    expect(formHasChanges({
      ids: ["a", "c"],
    }, {
      ids: ["a", "b"],
    })).toBe(true);
    // order-sensitive
    expect(formHasChanges({
      ids: ["b", "a"],
    }, {
      ids: ["a", "b"],
    })).toBe(true);
    expect(formHasChanges({
      ids: ["a"],
    }, {
      ids: ["a", "b"],
    })).toBe(true);
  });

  test("compares nested objects by value", () => {
    expect(
      formHasChanges(
        {
          criteria: {
            goal: "g",
            freeze: "",
          },
        },
        {
          criteria: {
            goal: "g",
            freeze: "",
          },
        },
      ),
    ).toBe(false);
    expect(
      formHasChanges(
        {
          criteria: {
            goal: "changed",
            freeze: "",
          },
        },
        {
          criteria: {
            goal: "g",
            freeze: "",
          },
        },
      ),
    ).toBe(true);
  });

  test("handles Date via getTime()", () => {
    expect(
      formHasChanges(
        {
          at: new Date("2026-06-13T00:00:00Z"),
        },
        {
          at: new Date("2026-06-13T00:00:00Z"),
        },
      ),
    ).toBe(false);
    expect(
      formHasChanges(
        {
          at: new Date("2026-06-14T00:00:00Z"),
        },
        {
          at: new Date("2026-06-13T00:00:00Z"),
        },
      ),
    ).toBe(true);
  });

  test("treats null distinct from empty string and undefined", () => {
    expect(formHasChanges({
      v: "",
    }, {
      v: null,
    })).toBe(true);
    expect(formHasChanges({
      v: undefined,
    }, {
      v: null,
    })).toBe(true);
  });

  test("only compares keys present in the baseline", () => {
    expect(
      formHasChanges({
        a: 1,
        extra: 99,
      }, {
        a: 1,
      }),
    ).toBe(false);
  });
});
