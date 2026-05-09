import type { DailiesViewMode } from "@/context/SettingsProviderContext";
import type { ReactNode } from "react";

import { useEffect, useState } from "react";

import {
  DEFAULT_MAX_ACTIVE_DAILIES,
  SettingsProviderContext,
} from "@/context/SettingsProviderContext";

const STORAGE_KEY = "emstack-settings";

interface PersistedSettings {
  maxActiveDailies?: number;
  dailiesViewMode?: DailiesViewMode | null;
}

function readPersistedSettings(): PersistedSettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
      if (persisted.dailiesViewMode === "table"
        || persisted.dailiesViewMode === "list") {
        return persisted.dailiesViewMode;
      }
      return null;
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          maxActiveDailies,
          dailiesViewMode,
        }),
      );
    }
    catch {
      // ignore quota errors
    }
  }, [maxActiveDailies, dailiesViewMode]);

  const setMaxActiveDailies = (value: number) => {
    if (Number.isFinite(value) && value > 0) {
      setMaxActiveDailiesState(Math.floor(value));
    }
  };

  const setDailiesViewMode = (value: DailiesViewMode | null) => {
    setDailiesViewModeState(value);
  };

  return (
    <SettingsProviderContext.Provider
      value={{
        settings: {
          maxActiveDailies,
          dailiesViewMode,
        },
        setMaxActiveDailies,
        setDailiesViewMode,
      }}
    >
      {children}
    </SettingsProviderContext.Provider>
  );
}
