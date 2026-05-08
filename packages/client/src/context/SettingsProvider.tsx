import type { ReactNode } from "react";

import { useEffect, useState } from "react";

import {
  DEFAULT_MAX_ACTIVE_DAILIES,
  SettingsProviderContext,
} from "@/context/SettingsProviderContext";

const STORAGE_KEY = "emstack-settings";

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({
  children,
}: SettingsProviderProps) {
  const [maxActiveDailies, setMaxActiveDailiesState] = useState<number>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_MAX_ACTIVE_DAILIES;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_MAX_ACTIVE_DAILIES;
      const parsed = JSON.parse(raw);
      const value = Number(parsed?.maxActiveDailies);
      if (Number.isFinite(value) && value > 0) {
        return Math.floor(value);
      }
    }
    catch {
      // ignore malformed value
    }
    return DEFAULT_MAX_ACTIVE_DAILIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          maxActiveDailies,
        }),
      );
    }
    catch {
      // ignore quota errors
    }
  }, [maxActiveDailies]);

  const setMaxActiveDailies = (value: number) => {
    if (Number.isFinite(value) && value > 0) {
      setMaxActiveDailiesState(Math.floor(value));
    }
  };

  return (
    <SettingsProviderContext.Provider
      value={{
        settings: {
          maxActiveDailies,
        },
        setMaxActiveDailies,
      }}
    >
      {children}
    </SettingsProviderContext.Provider>
  );
}
