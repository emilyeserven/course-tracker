import type { ControlledDialogProps } from "@/components/dialogProps";
import type { DashboardLayout, DashboardTileId } from "@emstack/types";

import { DASHBOARD_TILE_IDS } from "@emstack/types";

import { TILE_META } from "./-dashboardTileMeta";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface VisibleTilesDialogProps extends ControlledDialogProps {
  /** The layout whose tiles are being toggled, or null when closed. */
  layout: DashboardLayout | null;
  onToggleTile: (layout: DashboardLayout, tileId: DashboardTileId) => void;
}

/**
 * Tile-visibility picker. Replaces the long inline checkbox list that used to
 * live in the dashboard tab's "More" menu. Toggling is live: each change calls
 * `onToggleTile`, which persists optimistically so the grid updates behind the
 * modal and the checkmarks reflect the cache on the next render.
 */
export function VisibleTilesDialog({
  open,
  layout,
  onOpenChange,
  onToggleTile,
}: VisibleTilesDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Visible tiles</DialogTitle>
          <DialogDescription>
            {`Choose which tiles appear on ${layout?.name ?? "this layout"}.`}
          </DialogDescription>
        </DialogHeader>
        {layout && (
          <div className="flex flex-col gap-1">
            {DASHBOARD_TILE_IDS.map((tileId) => {
              const checked = layout.tiles.some(t => t.tileId === tileId);
              return (
                <Label
                  key={tileId}
                  className={`
                    cursor-pointer rounded-md p-2 font-normal
                    hover:bg-accent
                  `}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggleTile(layout, tileId)}
                  />
                  {TILE_META[tileId].title}
                </Label>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
