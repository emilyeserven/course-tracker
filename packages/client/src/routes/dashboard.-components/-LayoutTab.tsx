import type { DashboardLayout } from "@emstack/types";

import { LayoutGridIcon, MoreHorizontalIcon } from "lucide-react";

import { LayoutMenuActions } from "@/components/LayoutMenuActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TabsTrigger } from "@/components/ui/tabs";

interface LayoutTabProps {
  layout: DashboardLayout;
  onEditTiles: (layout: DashboardLayout) => void;
  onRename: (layout: DashboardLayout) => void;
  onDuplicate: (layout: DashboardLayout) => void;
  onSaveAs: (layout: DashboardLayout) => void;
  onDelete: (layout: DashboardLayout) => void;
}

/** A dashboard tab plus its hover-revealed "More" menu. The trigger is a
 * sibling of the Radix TabsTrigger (never nested, which would be invalid
 * button-in-button) and is always visible on touch where hover doesn't fire. */
export function LayoutTab({
  layout,
  onEditTiles,
  onRename,
  onDuplicate,
  onSaveAs,
  onDelete,
}: LayoutTabProps) {
  return (
    <div className="group relative">
      <TabsTrigger
        value={layout.id}
        className="pr-8"
      >
        {layout.name}
      </TabsTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${layout.name} options`}
            onClick={e => e.stopPropagation()}
            className="
              absolute top-1/2 right-1 flex size-5 -translate-y-1/2 items-center
              justify-center rounded-sm text-muted-foreground opacity-0
              transition-opacity
              group-focus-within:opacity-100
              group-hover:opacity-100
              hover:bg-background/60 hover:text-foreground
              focus-visible:opacity-100
              max-md:opacity-100
            "
          >
            <MoreHorizontalIcon className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEditTiles(layout)}>
            <LayoutGridIcon />
            Visible tiles…
          </DropdownMenuItem>
          <LayoutMenuActions
            layout={layout}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onSaveAs={onSaveAs}
            onDelete={onDelete}
            saveAsLabel="Save as layout…"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
