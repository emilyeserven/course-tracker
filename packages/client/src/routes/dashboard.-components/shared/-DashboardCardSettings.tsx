import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type * as React from "react";

import { SettingsIcon } from "lucide-react";

import { TileHeightSettings } from "./-TileHeightSettings";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MAX_TILE_ROWS, TILE_META } from "@/lib/dashboardTiles";

/**
 * The gear-icon flyout shown at the right of a card header. Always offers the
 * Auto/Fixed height choice; `children` add card-specific controls (e.g. the
 * Todoist display toggles or a link to Settings).
 */
export function CardSettingsFlyout({
  tile,
  onUpdateTile,
  children,
}: DashboardTileProps & { children?: React.ReactNode }) {
  const mode = tile.heightMode ?? "auto";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Card settings"
        >
          <SettingsIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex flex-col gap-3"
      >
        <TileHeightSettings
          mode={mode}
          onChange={heightMode =>
            onUpdateTile({
              heightMode,
            })}
          h={tile.h}
          minH={TILE_META[tile.tileId].minH}
          maxH={MAX_TILE_ROWS}
          onHeightChange={h =>
            onUpdateTile({
              h,
            })}
        />
        {children}
      </PopoverContent>
    </Popover>
  );
}
