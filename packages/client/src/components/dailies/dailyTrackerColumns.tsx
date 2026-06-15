import type { DailyDayHeader } from "@/hooks/useDailyTracker";
import type {
  Daily,
  DailyTrackerColumnKey,
  DailyTrackerColumnVisibility,
} from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { cn } from "@/lib/utils";

/**
 * Default column visibility for the daily-tracker tables: every toggleable
 * column on except the routine-title column, which is opt-in. Used wherever a
 * caller doesn't supply per-tile visibility (the routine tracker), so those
 * tables keep their existing layout.
 */
export const DEFAULT_DAILY_TRACKER_COLUMNS: Required<DailyTrackerColumnVisibility>
  = {
    progress: true,
    routine: false,
    type: true,
    cadence: true,
    streak: true,
    total: true,
    comment: true,
    days: true,
    location: true,
  };

/** Merge a partial per-tile visibility map over the defaults. */
export function resolveDailyTrackerColumns(
  columns?: DailyTrackerColumnVisibility,
): Required<DailyTrackerColumnVisibility> {
  return {
    ...DEFAULT_DAILY_TRACKER_COLUMNS,
    ...columns,
  };
}

/**
 * Toggleable columns in display order, with the labels shown in the card
 * settings menu. The always-on Title and Today's Status columns are absent by
 * design. Keyed off DAILY_TRACKER_TOGGLEABLE_COLUMNS in @emstack/types.
 */
export const DAILY_TRACKER_COLUMN_OPTIONS: {
  key: DailyTrackerColumnKey;
  label: string;
}[] = [
  {
    key: "progress",
    label: "Progress",
  },
  {
    key: "routine",
    label: "Routine",
  },
  {
    key: "type",
    label: "Type",
  },
  {
    key: "cadence",
    label: "Cadence",
  },
  {
    key: "streak",
    label: "Streak",
  },
  {
    key: "total",
    label: "Total",
  },
  {
    key: "comment",
    label: "Comment",
  },
  {
    key: "days",
    label: "Recent days",
  },
  {
    key: "location",
    label: "Location",
  },
];

interface DailyTrackerColumnsOptions {
  dayHeaders: DailyDayHeader[];
  /** Icon-only progress header (routine tracker); the dashboard shows the text. */
  progressHideLabel?: boolean;
  /** Visible progress header text; the dashboard shortens it to keep the column narrow. */
  progressLabel?: string;
  /** Today-status header className — the wider table adds `w-36`. */
  statusHeadClassName: string;
  /** Title header className — the dashboard uses `w-full` to absorb slack. */
  titleHeadClassName?: string;
  /** Per-tile column show/hide state; omit for the all-default tracker tables. */
  columns?: DailyTrackerColumnVisibility;
}

/**
 * Header column model for the active-daily tracker tables (dashboard card +
 * routine tracker). Only the progress and title columns sort; the recent-day
 * columns are derived from `dayHeaders`. The body is rendered by
 * `DailyTrackerRow` via `DataTable`'s `renderRow`, so these column defs supply
 * the header layout and sort state, not cell content.
 */
export function buildDailyTrackerColumns({
  dayHeaders,
  progressHideLabel = false,
  progressLabel = "Progress",
  statusHeadClassName,
  titleHeadClassName,
  columns,
}: DailyTrackerColumnsOptions): ColumnDef<Daily>[] {
  const vis = resolveDailyTrackerColumns(columns);
  // Emitted in display order; toggleable columns gate on `vis`. `name` (Title)
  // and `today` (Today's Status) are always present. Keep this order in lockstep
  // with DailyTrackerRow's `<td>` order so headers and cells stay aligned.
  const cols: ColumnDef<Daily>[] = [];

  if (vis.progress) {
    cols.push({
      id: "progress",
      sortDescFirst: true,
      header: ({
        column,
      }) => (
        <DataTableColumnHeader
          column={column}
          label={progressLabel}
          hideLabel={progressHideLabel}
        />
      ),
    });
  }

  cols.push({
    id: "name",
    sortDescFirst: false,
    meta: {
      headClassName: titleHeadClassName,
    },
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Title"
      />
    ),
  });

  if (vis.routine) {
    cols.push({
      id: "routine",
      enableSorting: false,
      header: "Routine",
    });
  }
  if (vis.type) {
    cols.push({
      id: "type",
      enableSorting: false,
      header: "Type",
    });
  }
  if (vis.cadence) {
    cols.push({
      id: "cadence",
      enableSorting: false,
      header: "Cadence",
    });
  }
  if (vis.streak) {
    cols.push({
      id: "streak",
      enableSorting: false,
      header: "Streak",
    });
  }
  if (vis.total) {
    cols.push({
      id: "total",
      enableSorting: false,
      header: "Total",
    });
  }
  if (vis.comment) {
    cols.push({
      id: "comment",
      enableSorting: false,
      header: () => null,
    });
  }

  cols.push({
    id: "today",
    enableSorting: false,
    meta: {
      headClassName: statusHeadClassName,
    },
    header: "Today's Status",
  });

  if (vis.days) {
    cols.push(
      ...dayHeaders.map((d): ColumnDef<Daily> => ({
        id: `day-${d.dateKey}`,
        enableSorting: false,
        meta: {
          headClassName: cn(
            "px-1 py-2 text-center font-medium",
            d.isToday && "text-foreground",
          ),
        },
        header: d.label,
      })),
    );
  }

  if (vis.location) {
    cols.push({
      id: "location",
      enableSorting: false,
      meta: {
        headClassName: "whitespace-nowrap",
      },
      header: "Location",
    });
  }

  return cols;
}
