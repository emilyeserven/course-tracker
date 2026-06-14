import type { RoutineConnectionType, RoutineMode } from "@emstack/types";

import { useMemo, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { EditForm, EditPageFooter, PageHeader } from "@/components/layout";
import { fillAllDays, rowsToWeekly } from "@/components/routines";
import { Button } from "@/components/ui/button";
import { createRoutine } from "@/utils";

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

const newRoutineSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  mode: z.enum(["weekly", "daily", "curated"]),
});

interface NewRoutineFormProps {
  /** Prefill source: the create page's validated search params. */
  search: {
    topicId?: string;
    connectedType?: RoutineConnectionType;
    connectedId?: string;
    mode?: RoutineMode;
    entryType?: "task" | "resource";
    entryId?: string;
  };
  onCreated: (id: string) => void | Promise<void>;
  onCancel: () => void;
}

export function NewRoutineForm({
  search,
  onCreated,
  onCancel,
}: NewRoutineFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  // New routines can be prefilled via search params: the generic
  // `?connectedType=&connectedId=` or the legacy `?topicId=` alias, plus an
  // optional `?entryType=&entryId=` that seeds the weekly grid.
  const prefilledConnections = useMemo(() => {
    const out: { type: RoutineConnectionType;
      id: string; }[] = [];
    if (search.connectedType && search.connectedId) {
      out.push({
        type: search.connectedType,
        id: search.connectedId,
      });
    }
    if (search.topicId) {
      out.push({
        type: "topic",
        id: search.topicId,
      });
    }
    return out;
  }, [search.connectedType, search.connectedId, search.topicId]);

  const form = useAppForm({
    defaultValues: {
      name: "",
      mode: search.mode ?? "weekly",
    },
    validators: {
      onSubmit: newRoutineSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      setIsSaving(true);
      try {
        const weekly
          = search.entryType && search.entryId
            ? rowsToWeekly(
              fillAllDays({
                type: search.entryType,
                id: search.entryId,
              }),
            )
            : {};
        const result = await createRoutine({
          name: value.name,
          mode: value.mode,
          status: "active",
          connections: prefilledConnections,
          weekly,
        });
        await onCreated(result.id);
      }
      catch {
        toast.error("Failed to create routine. Please try again.");
      }
      finally {
        setIsSaving(false);
      }
    },
  });

  const isSubmitting = useStore(form.store, state => state.isSubmitting);

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
