import type {
  DailiesViewMode,
  WeekTargetWindow,
} from "@/context/SettingsProviderContext";
import type { ReactNode } from "react";

import { useEffect, useState } from "react";

import { STORAGE_KEYS } from "@/constants/storageKeys";
import {
  DEFAULT_MAX_ACTIVE_DAILIES,
  DEFAULT_WEEK_TARGET_WINDOW,
  SettingsProviderContext,
  WEEK_TARGET_WINDOWS,
} from "@/context/SettingsProviderContext";

interface PersistedSettings {
  maxActiveDailies?: number;
  dailiesViewMode?: DailiesViewMode | null;
  weekTargetWindow?: WeekTargetWindow | null;
}

function readPersistedSettings(): PersistedSettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as PersistedSettings;
    }
  }
  catch {
    // ignore malformed value
  }
  return {};
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({
  children,
}: SettingsProviderProps) {
  const [maxActiveDailies, setMaxActiveDailiesState] = useState<number>(() => {
    const persisted = readPersistedSettings();
    const value = Number(persisted.maxActiveDailies);
    if (Number.isFinite(value) && value > 0) {
      return Math.floor(value);
    }
    return DEFAULT_MAX_ACTIVE_DAILIES;
  });

  const [dailiesViewMode, setDailiesViewModeState]
    = useState<DailiesViewMode | null>(() => {
      const persisted = readPersistedSettings();
      if (
        persisted.dailiesViewMode === "table"
        || persisted.dailiesViewMode === "list"
      ) {
        return persisted.dailiesViewMode;
      }
      return null;
    });

  const [weekTargetWindow, setWeekTargetWindowState]
    = useState<WeekTargetWindow>(() => {
      const persisted = readPersistedSettings();
      if (
        persisted.weekTargetWindow
        && WEEK_TARGET_WINDOWS.includes(persisted.weekTargetWindow)
      ) {
        return persisted.weekTargetWindow;
      }
      return DEFAULT_WEEK_TARGET_WINDOW;
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.settings,
        JSON.stringify({
          maxActiveDailies,
          dailiesViewMode,
          weekTargetWindow,
        }),
      );
    }
    catch {
      // ignore quota errors
    }
  }, [maxActiveDailies, dailiesViewMode, weekTargetWindow]);

  const setMaxActiveDailies = (value: number) => {
    if (Number.isFinite(value) && value > 0) {
      setMaxActiveDailiesState(Math.floor(value));
    }
  };

  const setDailiesViewMode = (value: DailiesViewMode | null) => {
    setDailiesViewModeState(value);
  };

  const setWeekTargetWindow = (value: WeekTargetWindow) => {
    setWeekTargetWindowState(value);
  };

  return (
    <SettingsProviderContext.Provider
      value={{
        settings: {
          maxActiveDailies,
          dailiesViewMode,
          weekTargetWindow,
        },
        setMaxActiveDailies,
        setDailiesViewMode,
        setWeekTargetWindow,
      }}
    >
      {children}
    </SettingsProviderContext.Provider>
  );
}
