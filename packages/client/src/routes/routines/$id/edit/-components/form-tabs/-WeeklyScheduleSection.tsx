import type { useRoutineDetailsForm } from "@/hooks/useRoutineDetailsForm";
import type { RoutineTemplate } from "@emstack/types";

import { QuickFillMenu, WeeklyEntryEditor } from "../weekly-entry";

import {
  fillAllDays,
  representativeRow,
  weeklyToRows,
  WeeklyScheduleField,
} from "@/components/routines";

type DetailsForm = ReturnType<typeof useRoutineDetailsForm>;

interface WeeklyScheduleSectionProps {
  form: DetailsForm["form"];
  isDaily: boolean;
  taskOptions: DetailsForm["taskOptions"];
  resourceOptions: DetailsForm["resourceOptions"];
}

// The non-curated schedule block on the `weekly` field: a single repeated entry
// for Daily mode, or the full 7-day grid (with a Quick Fill template menu) for
// Weekly mode. Internal to -DetailsTab.
export function WeeklyScheduleSection({
  form,
  isDaily,
  taskOptions,
  resourceOptions,
}: WeeklyScheduleSectionProps) {
  return (
    <form.Field name="weekly">
      {field =>
        isDaily
          ? (
            <div className="flex flex-col gap-1">
              <span className="text-2xl">Daily Task</span>
              <p className="text-sm text-muted-foreground">
                Pick what to work on each day — the same item applies to every day
                of the week.
              </p>
              <div className="mt-1">
                <WeeklyEntryEditor
                  {...representativeRow(field.state.value)}
                  onChange={next => field.handleChange(fillAllDays(next))}
                  taskOptions={taskOptions}
                  resourceOptions={resourceOptions}
                />
              </div>
            </div>
          )
          : (
            <div className="flex flex-col gap-1">
              <div
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-2xl">Weekly Schedule</span>
                <QuickFillMenu<RoutineTemplate>
                  kind="routine"
                  onSelect={template =>
                    field.handleChange(weeklyToRows(template.weekly))}
                />
              </div>
              <WeeklyScheduleField
                value={field.state.value}
                onChange={next => field.handleChange(next)}
                taskOptions={taskOptions}
                resourceOptions={resourceOptions}
              />
            </div>
          )}
    </form.Field>
  );
}
