import type { CuratedRow } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";

import { useState } from "react";

import { QuickAddResourceDialog } from "@/components/quickAdd/QuickAddResourceDialog";
import { ScheduleEntryRow } from "@/components/routines/ScheduleEntryRow";

// "Mon, Jun 15" — read in UTC to match the curated date keys.
function formatDateLabel(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface CuratedScheduleFieldProps {
  value: CuratedRow[];
  onChange: (next: CuratedRow[]) => void;
  taskOptions: SelectOption[];
  resourceOptions: SelectOption[];
}

// The curated schedule editor: one row per date from today through the chosen
// end date, reusing the shared ScheduleEntryRow. Empty until an end date is set.
export function CuratedScheduleField({
  value,
  onChange,
  taskOptions,
  resourceOptions,
}: CuratedScheduleFieldProps) {
  // Inline "Add resource" modal — shared across dates; only one combobox dropdown
  // is open at a time, so a single typed-text value and target date are enough.
  const [addOpen, setAddOpen] = useState(false);
  const [addForDate, setAddForDate] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

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
            label={formatDateLabel(row.date)}
            ariaPrefix={row.date}
            row={row}
            taskOptions={taskOptions}
            resourceOptions={resourceOptions}
            onChange={patch => update(row.date, patch)}
            onInputValueChange={setInputValue}
            onAddResource={() => {
              setAddForDate(row.date);
              setAddOpen(true);
            }}
          />
        ))}
      </ul>

      <QuickAddResourceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initialName={inputValue}
        onCreated={(newId) => {
          if (addForDate != null) {
            update(addForDate, {
              id: newId,
            });
          }
        }}
      />
    </div>
  );
}
