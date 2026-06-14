import type { DailiesViewMode } from "@/stores/settingsStore";

import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useDailiesViewModeSetting,
  useSetDailiesViewModeSetting,
} from "@/stores/settingsStore";

interface UseDailiesViewModeResult {
  mode: DailiesViewMode;
  setMode: (mode: DailiesViewMode) => void;
}

export function useDailiesViewMode(): UseDailiesViewModeResult {
  const isMobile = useIsMobile();
  const dailiesViewMode = useDailiesViewModeSetting();
  const setDailiesViewMode = useSetDailiesViewModeSetting();

  const mode: DailiesViewMode
    = dailiesViewMode ?? (isMobile ? "list" : "table");

  return {
    mode,
    setMode: setDailiesViewMode,
  };
}
