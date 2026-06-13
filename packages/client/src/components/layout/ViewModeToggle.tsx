import { LayoutGridIcon, ListIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "table";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  /** aria-label for the grid button (e.g. "Grid view" or "Card view"). */
  gridLabel: string;
}

/**
 * Grid/table view-mode switch shared by list pages (resources, topics).
 */
export function ViewModeToggle({
  viewMode,
  onChange,
  gridLabel,
}: ViewModeToggleProps) {
  return (
    <div
      className="
        ml-2 flex items-center rounded-md border border-input bg-transparent
      "
      role="group"
      aria-label="View mode"
    >
      <Button
        type="button"
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="icon"
        aria-label={gridLabel}
        aria-pressed={viewMode === "grid"}
        onClick={() => onChange("grid")}
      >
        <LayoutGridIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant={viewMode === "table" ? "secondary" : "ghost"}
        size="icon"
        aria-label="Table view"
        aria-pressed={viewMode === "table"}
        onClick={() => onChange("table")}
      >
        <ListIcon className="size-4" />
      </Button>
    </div>
  );
}
