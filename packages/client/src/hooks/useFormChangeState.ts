import type { AnyFormApi } from "@tanstack/react-form";

import { useStore } from "@tanstack/react-form";

import { formHasChanges } from "@/utils";

export interface FormChangeState<TValues> {
  /** A fresh snapshot of the form's current field values. */
  currentValues: TValues;
  /** Whether the form is mid-submit. */
  isSubmitting: boolean;
  /** Whether any field differs from `startingValues` (the unsaved-changes flag). */
  hasChanges: boolean;
}

/**
 * The change-tracking boilerplate every edit form repeats: subscribe to the
 * form store for a fresh snapshot of the current values and the submit state,
 * then diff the values against `startingValues` for the unsaved-changes flag.
 *
 * `AnyFormApi` erases the form's value type, so the precise type is recovered
 * from `startingValues` — which is the same object the form was given as its
 * `defaultValues`, so the two shapes are guaranteed to match.
 */
export function useFormChangeState<TValues extends Record<string, unknown>>(
  form: AnyFormApi,
  startingValues: TValues,
): FormChangeState<TValues> {
  const currentValues: TValues = useStore(form.store, state => ({
    ...(state.values as TValues),
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);
  return {
    currentValues,
    isSubmitting,
    hasChanges,
  };
}
