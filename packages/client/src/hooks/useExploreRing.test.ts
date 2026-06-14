import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { useExploreRing } from "./useExploreRing";

// The factory store is a module-global singleton, so each test sets a known
// value through setRing rather than relying on localStorage rehydration — these
// cases exercise the hook's fallback *derivation*, not persistence (covered in
// createPersistedValue.test.ts).
describe("useExploreRing", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("falls back to Trial when the selected ring isn't available", () => {
    const {
      result, rerender,
    } = renderHook(
      ({
        rings,
      }: { rings: string[] | undefined }) => useExploreRing(rings),
      {
        initialProps: {
          rings: ["Trial", "Junior", "Senior"] as string[] | undefined,
        },
      },
    );

    act(() => {
      result.current.setRing("Senior");
    });
    expect(result.current.ring).toBe("Senior");

    // "Senior" disappears from the available rings → fall back to "Trial".
    rerender({
      rings: ["Trial", "Junior"],
    });
    expect(result.current.ring).toBe("Trial");
  });

  test("keeps the selected ring while rings are still loading", () => {
    const {
      result, rerender,
    } = renderHook(
      ({
        rings,
      }: { rings: string[] | undefined }) => useExploreRing(rings),
      {
        initialProps: {
          rings: ["Trial", "Senior"] as string[] | undefined,
        },
      },
    );

    act(() => {
      result.current.setRing("Senior");
    });

    rerender({
      rings: undefined,
    });
    expect(result.current.ring).toBe("Senior");
  });

  test("setRing updates the surfaced ring", () => {
    const {
      result,
    } = renderHook(() => useExploreRing(["Trial", "Junior"]));
    act(() => {
      result.current.setRing("Junior");
    });
    expect(result.current.ring).toBe("Junior");
  });
});
