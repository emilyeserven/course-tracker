import type { DailiesViewMode } from "@/context/SettingsProviderContext";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useSettings } from "@/hooks/useSettings";

interface UseDailiesViewModeResult {
  mode: DailiesViewMode;
  setMode: (mode: DailiesViewMode) => void;
}

export function useDailiesViewMode(): UseDailiesViewModeResult {
  const isMobile = useIsMobile();
  const {
    settings, setDailiesViewMode,
  } = useSettings();

  const mode: DailiesViewMode = settings.dailiesViewMode
    ?? (isMobile ? "list" : "table");

  return {
    mode,
    setMode: setDailiesViewMode,
  };
}
