import { MoonIcon, SunIcon } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/useTheme";

/** Footer button that flips between light and dark mode. */
export function SidebarThemeToggle() {
  const {
    theme, setTheme,
  } = useTheme();

  // Resolve "system" to the scheme actually applied so the toggle always flips
  // to the opposite of what the user currently sees.
  const isDark
    = theme === "dark"
      || (theme === "system"
        && typeof window !== "undefined"
        && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip="Toggle theme"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
