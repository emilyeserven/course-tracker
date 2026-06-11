import { createContext } from "react";

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

interface AppSettings {
  maxActiveDailies: number;
  dailiesViewMode: DailiesViewMode | null;
  weekTargetWindow: WeekTargetWindow;
}

export const DEFAULT_MAX_ACTIVE_DAILIES = 5;
export const DEFAULT_WEEK_TARGET_WINDOW: WeekTargetWindow = "sunday";

const DEFAULT_SETTINGS: AppSettings = {
  maxActiveDailies: DEFAULT_MAX_ACTIVE_DAILIES,
  dailiesViewMode: null,
  weekTargetWindow: DEFAULT_WEEK_TARGET_WINDOW,
};

export interface SettingsProviderState {
  settings: AppSettings;
  setMaxActiveDailies: (value: number) => void;
  setDailiesViewMode: (value: DailiesViewMode | null) => void;
  setWeekTargetWindow: (value: WeekTargetWindow) => void;
}

const initialState: SettingsProviderState = {
  settings: DEFAULT_SETTINGS,
  setMaxActiveDailies: () => null,
  setDailiesViewMode: () => null,
  setWeekTargetWindow: () => null,
};

export const SettingsProviderContext
  = createContext<SettingsProviderState>(initialState);
