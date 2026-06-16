import type { Routine } from "@emstack/types";

import { Loader2 } from "lucide-react";

import { CuratedScheduleSection } from "./-CuratedScheduleSection";
import { modeOptionsFor, STATUS_OPTIONS } from "../-routineFormMeta";
import { WeeklyScheduleSection } from "./-WeeklyScheduleSection";

import { EditForm } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useRoutineDetailsForm } from "@/hooks/useRoutineDetailsForm";

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
    modulesByResource,
    moduleGroupsByResource,
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
            options={modeOptionsFor(field.state.value)}
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
          <CuratedScheduleSection
            form={form}
            setCuratedEndDate={setCuratedEndDate}
            curatedWindow={curatedWindow}
            taskOptions={taskOptions}
            resourceOptions={resourceOptions}
            moduleGroupsByResource={moduleGroupsByResource}
            modulesByResource={modulesByResource}
          />
        )
        : (
          <WeeklyScheduleSection
            form={form}
            isDaily={isDaily}
            taskOptions={taskOptions}
            resourceOptions={resourceOptions}
            moduleGroupsByResource={moduleGroupsByResource}
            modulesByResource={modulesByResource}
          />
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
