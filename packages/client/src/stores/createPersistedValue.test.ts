import { act } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { createPersistedValueStore } from "./createPersistedValue";

describe("createPersistedValueStore", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("rehydrates a legacy bare string value", () => {
    localStorage.setItem("test:legacy-bare", "table");
    const useStore = createPersistedValueStore<string>(
      "test:legacy-bare",
      "grid",
    );
    expect(useStore.getState().value).toBe("table");
  });

  test("rehydrates a persist envelope value", () => {
    localStorage.setItem(
      "test:envelope",
      JSON.stringify({
        state: {
          value: "list",
        },
        version: 0,
      }),
    );
    const useStore = createPersistedValueStore<string>("test:envelope", "grid");
    expect(useStore.getState().value).toBe("list");
  });

  test("falls back to the initial value when nothing is stored", () => {
    const useStore = createPersistedValueStore<string>("test:empty", "grid");
    expect(useStore.getState().value).toBe("grid");
  });

  test("setValue persists the new value", () => {
    const useStore = createPersistedValueStore<string>("test:set", "grid");
    act(() => {
      useStore.getState().setValue("table");
    });
    expect(useStore.getState().value).toBe("table");
    expect(localStorage.getItem("test:set")).toContain("table");
  });

  test("reads a legacyKey when the primary key is empty", () => {
    localStorage.setItem("test:old-key", "table");
    const useStore = createPersistedValueStore<string>("test:new-key", "grid", {
      legacyKey: "test:old-key",
    });
    expect(useStore.getState().value).toBe("table");
  });

  test("returns the same cached store for the same key", () => {
    const a = createPersistedValueStore<string>("test:cache", "grid");
    const b = createPersistedValueStore<string>("test:cache", "grid");
    expect(a).toBe(b);
  });
});
