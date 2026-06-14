import type { Routine, RoutineTemplate } from "@emstack/types";

import { Loader2 } from "lucide-react";

import { QuickFillMenu } from "./-QuickFillMenu";
import { WeeklyEntryEditor } from "./-WeeklyEntryEditor";

import { EditForm } from "@/components/layout";
import {
  CuratedEndDateField,
  CuratedScheduleField,
  fillAllDays,
  representativeRow,
  weeklyToRows,
  WeeklyScheduleField,
} from "@/components/routines";
import { Button } from "@/components/ui/button";
import { useRoutineDetailsForm } from "@/hooks/useRoutineDetailsForm";

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
  {
    value: "complete",
    label: "Complete",
  },
  {
    value: "paused",
    label: "Paused",
  },
];

const MODE_OPTIONS = [
  {
    value: "weekly",
    label: "Weekly Schedule",
  },
  {
    value: "daily",
    label: "Daily Task",
  },
  {
    value: "curated",
    label: "Curated",
  },
];

interface DetailsTabProps {
  routine: Routine;
  onSaved: () => Promise<void>;
  onChangeStateChange?: (hasChanges: boolean) => void;
}

export function DetailsTab({
  routine,
  onSaved,
  onChangeStateChange,
}: DetailsTabProps) {
  const {
    form,
    connectionOptions,
    taskOptions,
    resourceOptions,
    isDaily,
    isCurated,
    curatedWindow,
    setCuratedEndDate,
    isSaving,
  } = useRoutineDetailsForm(routine, onSaved, onChangeStateChange);

  return (
    // The EditForm + "Routine Name" + "Type" header is intentionally mirrored
    // by the create form (-NewRoutineForm) — the create/edit split keeps the
    // two forms separate, so the small overlap is accepted rather than shared
    // through a field-group abstraction.
    // fallow-ignore-next-line code-duplication
    <EditForm
      onSubmit={form.handleSubmit}
      className="flex max-w-3xl flex-col gap-8"
    >
      <form.AppField name="name">
        {field => <field.InputField label="Routine Name" />}
      </form.AppField>

      <form.AppField name="mode">
        {field => (
          <field.RadioGroupField
            label="Type"
            options={MODE_OPTIONS}
          />
        )}
      </form.AppField>

      <form.AppField name="connections">
        {field => (
          <field.MultiComboboxField
            label="Connected To"
            options={connectionOptions}
            groupByPrefix
            placeholder="Search topics, tasks, resources..."
          />
        )}
      </form.AppField>

      <form.AppField name="status">
        {field => (
          <field.RadioGroupField
            label="Status"
            options={STATUS_OPTIONS}
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {field => (
          <field.TextareaField
            label="Description"
            placeholder="What is this routine about?"
          />
        )}
      </form.AppField>

      {isCurated
        ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-2xl">Curated</span>
              <p className="text-sm text-muted-foreground">
                Pick an end date up to 14 days out, then set a task for each
                day from today through then.
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
                  resourceOptions={resourceOptions}
                />
              )}
            </form.Field>
          </div>
        )
        : (
          <form.Field name="weekly">
            {field =>
              isDaily
                ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl">Daily Task</span>
                    <p className="text-sm text-muted-foreground">
                      Pick what to work on each day — the same item applies to
                      every day of the week.
                    </p>
                    <div className="mt-1">
                      <WeeklyEntryEditor
                        {...representativeRow(field.state.value)}
                        onChange={next =>
                          field.handleChange(fillAllDays(next))}
                        taskOptions={taskOptions}
                        resourceOptions={resourceOptions}
                      />
                    </div>
                  </div>
                )
                : (
                  <div className="flex flex-col gap-1">
                    <div
                      className="
                        flex flex-wrap items-center justify-between gap-2
                      "
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
        )}

      {isDaily && (
        <div className="flex flex-col gap-1">
          <form.AppField name="weeklyTarget">
            {field => (
              <field.NumberField
                label="Days per week"
                min={1}
              />
            )}
          </form.AppField>
          <p className="text-sm text-muted-foreground">
            Optional. How many days a week this needs doing — once you hit it
            (counting days you reached your goal), the tracker shows “Nothing
            required today.” Leave blank to require it every day.
          </p>
        </div>
      )}

      <div>
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save Details
        </Button>
      </div>
    </EditForm>
  );
}
