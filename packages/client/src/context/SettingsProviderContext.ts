import { createContext } from "react";

export type DailiesViewMode = "table" | "list";

interface AppSettings {
  maxActiveDailies: number;
  dailiesViewMode: DailiesViewMode | null;
}

export const DEFAULT_MAX_ACTIVE_DAILIES = 5;

const DEFAULT_SETTINGS: AppSettings = {
  maxActiveDailies: DEFAULT_MAX_ACTIVE_DAILIES,
  dailiesViewMode: null,
};

interface SettingsProviderState {
  settings: AppSettings;
  setMaxActiveDailies: (value: number) => void;
  setDailiesViewMode: (value: DailiesViewMode | null) => void;
}

const initialState: SettingsProviderState = {
  settings: DEFAULT_SETTINGS,
  setMaxActiveDailies: () => null,
  setDailiesViewMode: () => null,
};

export const SettingsProviderContext
  = createContext<SettingsProviderState>(initialState);
