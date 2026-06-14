import type { DashboardLayout } from "@emstack/types";

import { BookmarkIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * The layout a row/tab acts on plus the four mutating actions every layout
 * menu offers. Shared by the dashboard tab menu (`LayoutTab`), the settings
 * layouts/presets rows (`LayoutRow`), and this menu body so the action set
 * stays in sync; each consumer extends it with its own extras.
 */
export interface LayoutMenuHandlers {
  layout: DashboardLayout;
  onRename: (layout: DashboardLayout) => void;
  onDuplicate: (layout: DashboardLayout) => void;
  onSaveAs: (layout: DashboardLayout) => void;
  onDelete: (layout: DashboardLayout) => void;
}

interface LayoutMenuActionsProps extends LayoutMenuHandlers {
  saveAsLabel: string;
  /** Hide the "Save as…" item (e.g. for template rows). Defaults to true. */
  showSaveAs?: boolean;
}

/**
 * Shared body for a layout's dropdown menu: a leading separator, the Rename
 * and Duplicate actions, the "Save as…" action, a separator, and the
 * destructive "Delete" action. Render inside a DropdownMenuContent after any
 * caller-specific items (e.g. the dashboard tab's "Visible tiles…"). Used by
 * the dashboard tab menu and the settings layouts/presets list so the two
 * stay in sync.
 */
export function LayoutMenuActions({
  layout,
  onRename,
  onDuplicate,
  onSaveAs,
  onDelete,
  saveAsLabel,
  showSaveAs = true,
}: LayoutMenuActionsProps) {
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => onRename(layout)}>
        <PencilIcon />
        Rename
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onDuplicate(layout)}>
        <CopyIcon />
        Duplicate
      </DropdownMenuItem>
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
