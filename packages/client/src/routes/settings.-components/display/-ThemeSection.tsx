import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme.ts";

export function ThemeSection() {
  const {
    theme, setTheme,
  } = useTheme();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col items-start gap-2">
        {theme === "dark"
          ? (
            <Button
              variant="outline"
              onClick={() => {
                setTheme("light");
              }}
            >
              <SunIcon />
              Set to Light Mode
            </Button>
          )
          : (
            <Button
              variant="outline"
              onClick={() => {
                setTheme("dark");
              }}
            >
              <MoonIcon />
              Set to Dark Mode
            </Button>
          )}
      </div>
    </section>
  );
}
