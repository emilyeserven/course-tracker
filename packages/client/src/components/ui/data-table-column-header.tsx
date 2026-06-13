import type { Column } from "@tanstack/react-table";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  label: string;
  align?: "left" | "right";
  /** Keep `label` for screen readers but hide it visually (icon-only header). */
  hideLabel?: boolean;
}

/**
 * Sortable column header for `DataTable`. Renders a plain label for columns that
 * can't sort, otherwise a button toggling the column's sort with asc/desc/none
 * arrow indicators. Replaces the per-table hand-rolled sort buttons.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  label,
  align = "left",
  hideLabel = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const labelEl = hideLabel
    ? <span className="sr-only">{label}</span>
    : <span>{label}</span>;

  if (!column.getCanSort()) {
    return labelEl;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        `
          inline-flex items-center gap-1 text-xs font-semibold
          text-muted-foreground uppercase transition-colors
          hover:text-foreground
          focus-visible:rounded-sm focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-ring
        `,
        align === "right" ? "justify-end" : "justify-start",
      )}
    >
      {labelEl}
      {sorted === "asc" && (
        <ArrowUpIcon
          className="size-3.5"
          aria-hidden="true"
        />
      )}
      {sorted === "desc" && (
        <ArrowDownIcon
          className="size-3.5"
          aria-hidden="true"
        />
      )}
      {!sorted && (
        <ArrowUpDownIcon
          className="size-3.5 opacity-40"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
