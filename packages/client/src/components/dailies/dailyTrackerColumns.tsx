import type { DailyDayHeader } from "@/hooks/useDailyTracker";
import type { Daily } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { cn } from "@/lib/utils";

interface DailyTrackerColumnsOptions {
  dayHeaders: DailyDayHeader[];
  /** Icon-only progress header (routine tracker); the dashboard shows the text. */
  progressHideLabel?: boolean;
  /** Today-status header className — the wider table adds `w-36`. */
  statusHeadClassName: string;
  /** Title header className — the dashboard uses `w-full` to absorb slack. */
  titleHeadClassName?: string;
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
  statusHeadClassName,
  titleHeadClassName,
}: DailyTrackerColumnsOptions): ColumnDef<Daily>[] {
  return [
    {
      id: "progress",
      sortDescFirst: true,
      header: ({
        column,
      }) => (
        <DataTableColumnHeader
          column={column}
          label="Progress"
          hideLabel={progressHideLabel}
        />
      ),
    },
    {
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
    },
    {
      id: "type",
      enableSorting: false,
      header: "Type",
    },
    {
      id: "cadence",
      enableSorting: false,
      header: "Cadence",
    },
    {
      id: "streak",
      enableSorting: false,
      header: "Streak",
    },
    {
      id: "total",
      enableSorting: false,
      header: "Total",
    },
    {
      id: "comment",
      enableSorting: false,
      header: () => null,
    },
    {
      id: "today",
      enableSorting: false,
      meta: {
        headClassName: statusHeadClassName,
      },
      header: "Today's Status",
    },
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
    {
      id: "location",
      enableSorting: false,
      meta: {
        headClassName: "whitespace-nowrap",
      },
      header: "Location",
    },
  ];
}
