import type { CuratedRow } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";

import { ScheduleEntryRow } from "@/components/routines/ScheduleEntryRow";
import { formatCuratedDateLabel } from "@/components/routines/weekly";

interface CuratedScheduleFieldProps {
  value: CuratedRow[];
  onChange: (next: CuratedRow[]) => void;
  taskOptions: SelectOption[];
}

// The curated schedule editor: one row per date from today through the chosen
// end date, reusing the shared ScheduleEntryRow. Empty until an end date is set.
export function CuratedScheduleField({
  value,
  onChange,
  taskOptions,
}: CuratedScheduleFieldProps) {
  function update(date: string, patch: Partial<CuratedRow>) {
    onChange(
      value.map(r =>
        r.date === date
          ? {
            ...r,
            ...patch,
          }
          : r),
    );
  }

  if (value.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        <i>Pick an end date above to set a task for each day up to then.</i>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {value.map(row => (
          <ScheduleEntryRow
            key={row.date}
            label={formatCuratedDateLabel(row.date)}
            ariaPrefix={row.date}
            row={row}
            taskOptions={taskOptions}
            onChange={patch => update(row.date, patch)}
          />
        ))}
      </ul>
    </div>
  );
}
