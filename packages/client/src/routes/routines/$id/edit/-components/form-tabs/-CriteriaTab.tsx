import type { DailyCriteriaTemplate, Routine } from "@emstack/types";

import { Loader2 } from "lucide-react";

import { QuickFillMenu } from "../weekly-entry";
import { useCriteriaForm } from "./-useCriteriaForm";

import { DAILY_STATUS_OPTIONS } from "@/components/dailies";
import { Button } from "@/components/ui/button";

interface CriteriaTabProps {
  routine: Routine;
  onSaved: () => Promise<void>;
  onChangeStateChange?: (hasChanges: boolean) => void;
}

export function CriteriaTab({
  routine,
  onSaved,
  onChangeStateChange,
}: CriteriaTabProps) {
  const {
    form, isSaving,
  } = useCriteriaForm({
    routine,
    onSaved,
    onChangeStateChange,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex max-w-3xl flex-col gap-8"
    >
      <div className="flex flex-col gap-4 rounded-md border bg-card p-4">
        <div
          className="flex flex-row flex-wrap items-start justify-between gap-2"
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              Optional notes describing what each status means for this routine.
            </p>
          </div>
          <QuickFillMenu<DailyCriteriaTemplate>
            kind="criteria"
            onSelect={(template) => {
              form.setFieldValue("criteriaIncomplete", template.incomplete);
              form.setFieldValue("criteriaTouched", template.touched);
              form.setFieldValue("criteriaGoal", template.goal);
              form.setFieldValue("criteriaExceeded", template.exceeded);
              form.setFieldValue("criteriaFreeze", template.freeze);
            }}
          />
        </div>
        <form.AppField name="criteriaIncomplete">
          {field => (
            <field.TextareaField
              label="Incomplete"
              placeholder='What does "Incomplete" mean here?'
              labelIcon={
                DAILY_STATUS_OPTIONS.find(o => o.value === "incomplete")?.icon
              }
            />
          )}
        </form.AppField>
        <form.AppField name="criteriaTouched">
          {field => (
            <field.TextareaField
              label="Touched"
              placeholder='What does "Touched" mean here?'
              labelIcon={
                DAILY_STATUS_OPTIONS.find(o => o.value === "touched")?.icon
              }
            />
          )}
        </form.AppField>
        <form.AppField name="criteriaGoal">
          {field => (
            <field.TextareaField
              label="Completed (Goal)"
              placeholder='What does "Completed" (goal) mean here?'
              labelIcon={
                DAILY_STATUS_OPTIONS.find(o => o.value === "goal")?.icon
              }
            />
          )}
        </form.AppField>
        <form.AppField name="criteriaExceeded">
          {field => (
            <field.TextareaField
              label="Exceeded"
              placeholder='What does "Exceeded" mean here?'
              labelIcon={
                DAILY_STATUS_OPTIONS.find(o => o.value === "exceeded")?.icon
              }
            />
          )}
        </form.AppField>
        <form.AppField name="criteriaFreeze">
          {field => (
            <field.TextareaField
              label="Freeze"
              placeholder='What does "Freeze" mean here?'
              labelIcon={
                DAILY_STATUS_OPTIONS.find(o => o.value === "freeze")?.icon
              }
            />
          )}
        </form.AppField>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save Status Criteria
        </Button>
      </div>
    </form>
  );
}
