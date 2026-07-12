import type { useRoutineDetailsForm } from "@/hooks/useRoutineDetailsForm";

import {
  CuratedEndDateField,
  CuratedScheduleField,
} from "@/components/routines";

type DetailsForm = ReturnType<typeof useRoutineDetailsForm>;

interface CuratedScheduleSectionProps {
  form: DetailsForm["form"];
  setCuratedEndDate: DetailsForm["setCuratedEndDate"];
  curatedWindow: DetailsForm["curatedWindow"];
  taskOptions: DetailsForm["taskOptions"];
}

// The "Curated" schedule block: an end-date picker (capped at 14 days out) plus a
// per-day task schedule. Internal to -DetailsTab.
export function CuratedScheduleSection({
  form,
  setCuratedEndDate,
  curatedWindow,
  taskOptions,
}: CuratedScheduleSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-2xl">Curated</span>
        <p className="text-sm text-muted-foreground">
          Pick an end date up to 14 days out, then set a task for each day from
          today through then.
        </p>
      </div>
      <form.Field name="curatedEndDate">
        {field => (
          <CuratedEndDateField
            value={field.state.value}
            onSelect={setCuratedEndDate}
            minDate={curatedWindow.min}
            maxDate={curatedWindow.max}
          />
        )}
      </form.Field>
      <form.Field name="curated">
        {field => (
          <CuratedScheduleField
            value={field.state.value}
            onChange={next => field.handleChange(next)}
            taskOptions={taskOptions}
          />
        )}
      </form.Field>
    </div>
  );
}
