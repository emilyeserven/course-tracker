import type { Routine } from "@emstack/types";

import { useEffect, useMemo, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { TEXT_MAX_LENGTH } from "@/constants/stringLimits";
import { formHasChanges, upsertRoutine } from "@/utils";

const criteriaSchema = z.object({
  criteriaIncomplete: z.string().max(TEXT_MAX_LENGTH),
  criteriaTouched: z.string().max(TEXT_MAX_LENGTH),
  criteriaGoal: z.string().max(TEXT_MAX_LENGTH),
  criteriaExceeded: z.string().max(TEXT_MAX_LENGTH),
  criteriaFreeze: z.string().max(TEXT_MAX_LENGTH),
});

interface UseCriteriaFormArgs {
  routine: Routine;
  onSaved: () => Promise<void>;
  onChangeStateChange?: (hasChanges: boolean) => void;
}

/**
 * Form state + partial-save for the routine status-criteria tab: seeds the five
 * criteria fields from the routine, tracks unsaved changes (reported via
 * `onChangeStateChange`), and on submit writes only `{ name, criteria }` so the
 * backend merge preserves the rest of the routine.
 */
export function useCriteriaForm({
  routine,
  onSaved,
  onChangeStateChange,
}: UseCriteriaFormArgs) {
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

        // Partial save: `name` is included to satisfy the upsert body schema;
        // the backend merge preserves the routine's schedule, connections and
        // completions since they're omitted here.
        await upsertRoutine(routine.id, {
          name: routine.name,
          criteria,
        });
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
  const hasChanges = formHasChanges(currentValues, startingValues);

  useEffect(() => {
    onChangeStateChange?.(hasChanges);
  }, [hasChanges, onChangeStateChange]);

  return {
    form,
    isSaving,
  };
}
