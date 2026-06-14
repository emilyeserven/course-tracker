import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { STORAGE_KEYS } from "@/constants/storageKeys";

import {
  DEFAULT_MAX_ACTIVE_DAILIES,
  DEFAULT_WEEK_TARGET_WINDOW,
  useSettingsStore,
} from "./settingsStore";

const KEY = STORAGE_KEYS.settings;

function resetStore() {
  useSettingsStore.setState({
    maxActiveDailies: DEFAULT_MAX_ACTIVE_DAILIES,
    dailiesViewMode: null,
    weekTargetWindow: DEFAULT_WEEK_TARGET_WINDOW,
  });
}

describe("settingsStore", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("rehydrates from a legacy bare settings blob", async () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        maxActiveDailies: 8,
        dailiesViewMode: "list",
        weekTargetWindow: "rolling7",
      }),
    );

    await act(async () => {
      await useSettingsStore.persist.rehydrate();
    });

    const state = useSettingsStore.getState();
    expect(state.maxActiveDailies).toBe(8);
    expect(state.dailiesViewMode).toBe("list");
    expect(state.weekTargetWindow).toBe("rolling7");
  });

  test("coerces invalid legacy values to defaults on rehydrate", async () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        maxActiveDailies: -3,
        dailiesViewMode: "bogus",
        weekTargetWindow: "whenever",
      }),
    );

    await act(async () => {
      await useSettingsStore.persist.rehydrate();
    });

    const state = useSettingsStore.getState();
    expect(state.maxActiveDailies).toBe(DEFAULT_MAX_ACTIVE_DAILIES);
    expect(state.dailiesViewMode).toBeNull();
    expect(state.weekTargetWindow).toBe(DEFAULT_WEEK_TARGET_WINDOW);
  });

  test("setMaxActiveDailies floors valid input and rejects non-positive", () => {
    act(() => {
      useSettingsStore.getState().setMaxActiveDailies(3.7);
    });
    expect(useSettingsStore.getState().maxActiveDailies).toBe(3);

    // Guard: zero, negative, and NaN leave the previous value untouched.
    act(() => {
      useSettingsStore.getState().setMaxActiveDailies(0);
      useSettingsStore.getState().setMaxActiveDailies(-5);
      useSettingsStore.getState().setMaxActiveDailies(Number.NaN);
    });
    expect(useSettingsStore.getState().maxActiveDailies).toBe(3);
  });
});
