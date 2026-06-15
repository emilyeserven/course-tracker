import type { NewRoutineSearch } from "./-useNewRoutineForm";

import { Loader2 } from "lucide-react";

import { MODE_OPTIONS } from "../-routineFormMeta";
import { useNewRoutineForm } from "./-useNewRoutineForm";

import { EditForm, EditPageFooter, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";

interface NewRoutineFormProps {
  search: NewRoutineSearch;
  onCreated: (id: string) => void | Promise<void>;
  onCancel: () => void;
}

export function NewRoutineForm({
  search,
  onCreated,
  onCancel,
}: NewRoutineFormProps) {
  const {
    form, isSaving, isSubmitting,
  } = useNewRoutineForm({
    search,
    onCreated,
  });

  return (
    <div>
      <PageHeader
        pageTitle="New Routine"
        pageSection="routines"
      />
      <div className="m-auto w-full max-w-[1200px] px-4">
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

          <EditPageFooter isNew>
            <Button
              type="submit"
              disabled={isSubmitting || isSaving}
            >
              {(isSubmitting || isSaving) && (
                <Loader2 className="animate-spin" />
              )}
              Create Routine
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </EditPageFooter>
        </EditForm>
      </div>
    </div>
  );
}
