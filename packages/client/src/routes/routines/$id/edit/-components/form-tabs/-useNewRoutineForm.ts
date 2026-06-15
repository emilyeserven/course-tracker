import type { RoutineConnectionType, RoutineMode } from "@emstack/types";

import { useMemo, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { fillAllDays, rowsToWeekly } from "@/components/routines";
import { NAME_MAX_LENGTH } from "@/constants/stringLimits";
import { createRoutine } from "@/utils";

const newRoutineSchema = z.object({
  name: z.string().min(1, "Name is required").max(NAME_MAX_LENGTH),
  mode: z.enum(["weekly", "daily", "curated"]),
});

/** Prefill source: the create page's validated search params. */
export interface NewRoutineSearch {
  topicId?: string;
  connectedType?: RoutineConnectionType;
  connectedId?: string;
  mode?: RoutineMode;
  entryType?: "task" | "resource";
  entryId?: string;
}

interface UseNewRoutineFormArgs {
  search: NewRoutineSearch;
  onCreated: (id: string) => void | Promise<void>;
}

/**
 * Form state + create for the new-routine tab: derives prefilled connections
 * from the search params (the generic `connectedType/connectedId` pair or the
 * legacy `topicId` alias) and, on submit, seeds the weekly grid from an optional
 * `entryType/entryId` before creating the routine.
 */
export function useNewRoutineForm({
  search,
  onCreated,
}: UseNewRoutineFormArgs) {
  const [isSaving, setIsSaving] = useState(false);

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

  return {
    form,
    isSaving,
    isSubmitting,
  };
}
