import type { PersistStorage, StorageValue } from "zustand/middleware";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { persistedRemoveItem, persistedSetItem } from "./persistStorageWrite";

import { STORAGE_KEYS } from "@/constants/storageKeys";

export type DailiesViewMode = "table" | "list";

// How the "X days a week" routine target counts a week:
// - "sunday"   : calendar week, Sunday → Saturday
// - "monday"   : calendar week, Monday → Sunday
// - "rolling7" : the trailing 7-day window ending today
export type WeekTargetWindow = "sunday" | "monday" | "rolling7";

export const WEEK_TARGET_WINDOWS: WeekTargetWindow[] = [
  "sunday",
  "monday",
  "rolling7",
];

export const DEFAULT_MAX_ACTIVE_DAILIES = 5;
export const DEFAULT_WEEK_TARGET_WINDOW: WeekTargetWindow = "sunday";

interface SettingsState {
  maxActiveDailies: number;
  dailiesViewMode: DailiesViewMode | null;
  weekTargetWindow: WeekTargetWindow;
  setMaxActiveDailies: (value: number) => void;
  setDailiesViewMode: (value: DailiesViewMode | null) => void;
  setWeekTargetWindow: (value: WeekTargetWindow) => void;
}

/** The persisted data slice (the action fns are recreated on each load). */
type PersistedSettings = Pick<
  SettingsState,
  "maxActiveDailies" | "dailiesViewMode" | "weekTargetWindow"
>;

/**
 * Validate/normalise a loosely-typed settings object into a complete, valid
 * one — the same guards the old hand-rolled provider applied (finite/>0/floor
 * for the limit, the `"table" | "list"` view-mode check, the window allow-list),
 * with defaults filled for anything missing or malformed.
 */
function coerceSettings(
  value: Partial<PersistedSettings> | undefined,
): PersistedSettings {
  const max = Number(value?.maxActiveDailies);
  const viewMode = value?.dailiesViewMode;
  const window = value?.weekTargetWindow;
  return {
    maxActiveDailies:
      Number.isFinite(max) && max > 0
        ? Math.floor(max)
        : DEFAULT_MAX_ACTIVE_DAILIES,
    dailiesViewMode:
      viewMode === "table" || viewMode === "list" ? viewMode : null,
    weekTargetWindow:
      window && WEEK_TARGET_WINDOWS.includes(window)
        ? window
        : DEFAULT_WEEK_TARGET_WINDOW,
  };
}

/**
 * localStorage adapter that tolerates the pre-Zustand value shape. The old
 * `SettingsProvider` stored a bare `{ maxActiveDailies, dailiesViewMode,
 * weekTargetWindow }` object; `persist` wraps state as `{ state, version }`.
 * On read we detect the legacy bare object (no `state` key) and present it as a
 * version-0 envelope so the `migrate` step coerces it instead of resetting.
 */
const settingsStorage: PersistStorage<SettingsState> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(name);
    }
    catch {
      return null;
    }
    if (!raw) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    }
    catch {
      return null;
    }
    if (!parsed || typeof parsed !== "object") return null;
    if ("state" in parsed) {
      return parsed as StorageValue<SettingsState>;
    }
    // Legacy bare settings object written before the store existed.
    return {
      state: parsed as SettingsState,
      version: 0,
    };
  },
  setItem: persistedSetItem,
  removeItem: persistedRemoveItem,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      maxActiveDailies: DEFAULT_MAX_ACTIVE_DAILIES,
      dailiesViewMode: null,
      weekTargetWindow: DEFAULT_WEEK_TARGET_WINDOW,
      setMaxActiveDailies: (value) => {
        if (Number.isFinite(value) && value > 0) {
          set({
            maxActiveDailies: Math.floor(value),
          });
        }
      },
      setDailiesViewMode: value =>
        set({
          dailiesViewMode: value,
        }),
      setWeekTargetWindow: value =>
        set({
          weekTargetWindow: value,
        }),
    }),
    {
      name: STORAGE_KEYS.settings,
      version: 1,
      storage: settingsStorage,
      migrate: persisted =>
        coerceSettings(
          persisted as Partial<PersistedSettings>,
        ) as SettingsState,
    },
  ),
);

export const useMaxActiveDailies = () =>
  useSettingsStore(s => s.maxActiveDailies);
export const useSetMaxActiveDailies = () =>
  useSettingsStore(s => s.setMaxActiveDailies);
export const useWeekTargetWindow = () =>
  useSettingsStore(s => s.weekTargetWindow);
export const useSetWeekTargetWindow = () =>
  useSettingsStore(s => s.setWeekTargetWindow);
export const useDailiesViewModeSetting = () =>
  useSettingsStore(s => s.dailiesViewMode);
export const useSetDailiesViewModeSetting = () =>
  useSettingsStore(s => s.setDailiesViewMode);
