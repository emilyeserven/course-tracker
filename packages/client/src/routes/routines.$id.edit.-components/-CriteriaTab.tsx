import type { Routine } from "@emstack/types/src";

import { useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, Loader2, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { DAILY_STATUS_OPTIONS } from "@/components/dailies/dailyStatusMeta";
import { useAppForm } from "@/components/formFields";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchDailyCriteriaTemplates,
  formHasChanges,
  upsertRoutine,
} from "@/utils";

const criteriaSchema = z.object({
  criteriaIncomplete: z.string().max(500),
  criteriaTouched: z.string().max(500),
  criteriaGoal: z.string().max(500),
  criteriaExceeded: z.string().max(500),
  criteriaFreeze: z.string().max(500),
});

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
    data: criteriaTemplates,
  } = useQuery({
    queryKey: ["dailyCriteriaTemplates"],
    queryFn: () => fetchDailyCriteriaTemplates(),
  });

  const startingValues = useMemo(
    () => ({
      criteriaIncomplete: routine.criteria?.incomplete ?? "",
      criteriaTouched: routine.criteria?.touched ?? "",
      criteriaGoal: routine.criteria?.goal ?? "",
      criteriaExceeded: routine.criteria?.exceeded ?? "",
      criteriaFreeze: routine.criteria?.freeze ?? "",
    }),
    [routine],
  );

  const lastSavedRef = useRef(startingValues);
  const [isSaving, setIsSaving] = useState(false);

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: criteriaSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      setIsSaving(true);
      try {
        const criteria: Record<string, string> = {};
        if (value.criteriaIncomplete) {
          criteria.incomplete = value.criteriaIncomplete;
        }
        if (value.criteriaTouched) {
          criteria.touched = value.criteriaTouched;
        }
        if (value.criteriaGoal) {
          criteria.goal = value.criteriaGoal;
        }
        if (value.criteriaExceeded) {
          criteria.exceeded = value.criteriaExceeded;
        }
        if (value.criteriaFreeze) {
          criteria.freeze = value.criteriaFreeze;
        }

        // Partial save: only `criteria` is sent, so the routine's schedule,
        // connections and completions are preserved by the backend merge.
        await upsertRoutine(routine.id, {
          criteria,
        });
        lastSavedRef.current = value;
        onChangeStateChange?.(false);
        await onSaved();
        toast.success("Status criteria saved.");
      }
      catch {
        toast.error("Failed to save status criteria.");
      }
      finally {
        setIsSaving(false);
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const hasChanges = formHasChanges(currentValues, lastSavedRef.current);

  useEffect(() => {
    onChangeStateChange?.(hasChanges);
  }, [hasChanges, onChangeStateChange]);

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
            <h2 className="text-2xl">Status Criteria</h2>
            <p className="text-sm text-muted-foreground">
              Optional notes describing what each status means for this
              routine.
            </p>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
              >
                <WandSparklesIcon className="size-4" />
                Quick Fill
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(criteriaTemplates ?? []).length === 0
                ? (
                  <DropdownMenuItem disabled>
                    No templates — add one in Settings
                  </DropdownMenuItem>
                )
                : (criteriaTemplates ?? []).map(template => (
                  <DropdownMenuItem
                    key={template.id}
                    onSelect={() => {
                      form.setFieldValue(
                        "criteriaIncomplete",
                        template.incomplete,
                      );
                      form.setFieldValue("criteriaTouched", template.touched);
                      form.setFieldValue("criteriaGoal", template.goal);
                      form.setFieldValue(
                        "criteriaExceeded",
                        template.exceeded,
                      );
                      form.setFieldValue("criteriaFreeze", template.freeze);
                    }}
                  >
                    {template.label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <form.AppField name="criteriaIncomplete">
          {field => (
            <field.TextareaField
              label="Incomplete"
              placeholder="What does &quot;Incomplete&quot; mean here?"
              labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                o.value === "incomplete")?.icon}
            />
          )}
        </form.AppField>
        <form.AppField name="criteriaTouched">
          {field => (
            <field.TextareaField
              label="Touched"
              placeholder="What does &quot;Touched&quot; mean here?"
              labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                o.value === "touched")?.icon}
            />
          )}
        </form.AppField>
        <form.AppField name="criteriaGoal">
          {field => (
            <field.TextareaField
              label="Completed (Goal)"
              placeholder="What does &quot;Completed&quot; (goal) mean here?"
              labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                o.value === "goal")?.icon}
            />
          )}
        </form.AppField>
        <form.AppField name="criteriaExceeded">
          {field => (
            <field.TextareaField
              label="Exceeded"
              placeholder="What does &quot;Exceeded&quot; mean here?"
              labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                o.value === "exceeded")?.icon}
            />
          )}
        </form.AppField>
        <form.AppField name="criteriaFreeze">
          {field => (
            <field.TextareaField
              label="Freeze"
              placeholder="What does &quot;Freeze&quot; mean here?"
              labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                o.value === "freeze")?.icon}
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
