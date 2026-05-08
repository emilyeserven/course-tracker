import { useContext } from "react";

import { SettingsProviderContext } from "@/context/SettingsProviderContext";

export function useSettings() {
  return useContext(SettingsProviderContext);
}
