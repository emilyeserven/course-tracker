import type { OnChangeFn, SortingState, Updater } from "@tanstack/react-table";

/** Sort direction for the app's single-column, caller-sorted tables. */
export type SortDirection = "asc" | "desc";

/** Build a single-column TanStack `SortingState` from a column id + direction. */
export function toSortingState(
  id: string,
  direction: SortDirection,
): SortingState {
  return [
    {
      id,
      desc: direction === "desc",
    },
  ];
}

/**
 * Bridge TanStack's `onSortingChange` to a plain `(id, direction)` callback for
 * tables that keep their sort as a key/dir pair and sort the rows themselves
 * (`manualSorting`). Updates that clear the sort are ignored, matching the
 * app's toggle-only headers.
 */
export function makeManualSortHandler(
  current: SortingState,
  onChange: (id: string, direction: SortDirection) => void,
): OnChangeFn<SortingState> {
  return (updater: Updater<SortingState>) => {
    const next = typeof updater === "function" ? updater(current) : updater;
    const first = next[0];
    if (!first) return;
    onChange(first.id, first.desc ? "desc" : "asc");
  };
}
