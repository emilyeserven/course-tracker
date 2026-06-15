import type { DashboardTileProps } from "@/lib/dashboardTiles";

import { SettingToggle } from "../DashboardCard/-cardKit";

import {
  DAILY_TRACKER_COLUMN_OPTIONS,
  resolveDailyTrackerColumns,
} from "@/components/dailies";

/**
 * The "Columns" section of the Do Now / Done for the Day settings flyout: one
 * toggle per show/hide-able tracker column. Visibility is stored per tile (so
 * it's per dashboard tab and independent for each card) via `onUpdateTile`.
 * Title and Today's Status are always shown and have no toggle.
 */
export function DailiesColumnSettings({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const columns = resolveDailyTrackerColumns(tile.columns);
  return (
    <div className="flex flex-col gap-2 border-t pt-3">
      <span
        className="
          text-xs font-semibold tracking-wide text-muted-foreground uppercase
        "
      >
        Columns
      </span>
      {DAILY_TRACKER_COLUMN_OPTIONS.map(({
        key, label,
      }) => (
        <SettingToggle
          key={key}
          label={label}
          checked={columns[key]}
          onChange={checked =>
            onUpdateTile({
              columns: {
                ...columns,
                [key]: checked,
              },
            })}
        />
      ))}
    </div>
  );
}
