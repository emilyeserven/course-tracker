import type { DashboardLayout } from "@emstack/types";

import { BookmarkIcon, Trash2Icon } from "lucide-react";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface LayoutMenuActionsProps {
  layout: DashboardLayout;
  onSaveAs: (layout: DashboardLayout) => void;
  onDelete: (layout: DashboardLayout) => void;
  saveAsLabel: string;
  /** Hide the "Save as…" item (e.g. for template rows). Defaults to true. */
  showSaveAs?: boolean;
}

/**
 * Shared footer for a layout's dropdown menu: the "Save as…" action, a
 * separator, and the destructive "Delete" action. Render inside a
 * DropdownMenuContent. Used by the dashboard tab menu and the settings
 * layouts/presets list so the two stay in sync.
 */
export function LayoutMenuActions({
  layout,
  onSaveAs,
  onDelete,
  saveAsLabel,
  showSaveAs = true,
}: LayoutMenuActionsProps) {
  return (
    <>
      {showSaveAs && (
        <DropdownMenuItem onSelect={() => onSaveAs(layout)}>
          <BookmarkIcon />
          {saveAsLabel}
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        onSelect={() => onDelete(layout)}
      >
        <Trash2Icon />
        Delete
      </DropdownMenuItem>
    </>
  );
}
