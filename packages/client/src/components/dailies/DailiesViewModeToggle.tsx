import type { DailiesViewMode } from "@/context/SettingsProviderContext";

import { LayoutListIcon, TableIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DailiesViewModeToggleProps {
  mode: DailiesViewMode;
  onChange: (mode: DailiesViewMode) => void;
  className?: string;
}

export function DailiesViewModeToggle({
  mode,
  onChange,
  className,
}: DailiesViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Dailies view mode"
      className={cn(
        "inline-flex items-center rounded-md border bg-background p-0.5",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Table view"
        aria-pressed={mode === "table"}
        onClick={() => onChange("table")}
        className={cn(
          `
            inline-flex size-7 items-center justify-center rounded-sm
            transition-colors
            focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:outline-none
          `,
          mode === "table"
            ? "bg-muted text-foreground"
            : `
              text-muted-foreground
              hover:bg-muted/60
            `,
        )}
      >
        <TableIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="List view"
        aria-pressed={mode === "list"}
        onClick={() => onChange("list")}
        className={cn(
          `
            inline-flex size-7 items-center justify-center rounded-sm
            transition-colors
            focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:outline-none
          `,
          mode === "list"
            ? "bg-muted text-foreground"
            : `
              text-muted-foreground
              hover:bg-muted/60
            `,
        )}
      >
        <LayoutListIcon className="size-4" />
      </button>
    </div>
  );
}
