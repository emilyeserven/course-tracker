import { createContext } from "react";

export interface AppSettings {
  maxActiveDailies: number;
}

export const DEFAULT_MAX_ACTIVE_DAILIES = 5;

export const DEFAULT_SETTINGS: AppSettings = {
  maxActiveDailies: DEFAULT_MAX_ACTIVE_DAILIES,
};

interface SettingsProviderState {
  settings: AppSettings;
  setMaxActiveDailies: (value: number) => void;
}

const initialState: SettingsProviderState = {
  settings: DEFAULT_SETTINGS,
  setMaxActiveDailies: () => null,
};

export const SettingsProviderContext
  = createContext<SettingsProviderState>(initialState);
