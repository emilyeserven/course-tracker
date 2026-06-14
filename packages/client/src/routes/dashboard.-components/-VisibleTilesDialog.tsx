import type { ControlledDialogProps } from "@/types/dialogProps";
import type { DashboardLayout, DashboardTileId } from "@emstack/types";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { tileVisibilityItems } from "@/lib/dashboardTiles";

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
            {tileVisibilityItems(layout).map(({
              tileId, title, checked,
            }) => (
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
                {title}
              </Label>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
