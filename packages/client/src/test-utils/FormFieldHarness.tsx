import type { ReactNode } from "react";

import { useAppForm } from "@/hooks/useAppForm";
import { FieldChangeHighlightContext } from "@/utils/fieldChangeHighlight";

/**
 * Provides TanStack-Form field context for a single field so the
 * `components/formFields/*` components — which read `useFieldContext()` and crash
 * without a form around them — can be rendered in isolation (stories and tests).
 *
 * It mounts a one-field form (`useAppForm`) and renders `children` inside
 * `form.AppField`, which supplies the field context. A directly-imported field
 * (e.g. `<InputField label="…" />`) returned from `children` therefore gets a
 * real field API, so value seeding and typing interactions work.
 *
 * `children` is a **render function** (not an element): `form.AppField`
 * re-invokes it on every field-state change, so a controlled field re-renders
 * with the new value when the user interacts. Passing a static element instead
 * would hit React's same-element bailout and freeze the field on its initial value.
 *
 * `defaultValue` seeds the field's value/type (string, number, Date, string[], …)
 * — pass it per story to render Default/Filled/… states. Set `highlightChanges`
 * to exercise the changed-field tint (`FieldChangeHighlightContext`).
 */
export function FormFieldHarness<TValue>({
  defaultValue,
  highlightChanges = false,
  children,
}: {
  defaultValue: TValue;
  highlightChanges?: boolean;
  children: () => ReactNode;
}) {
  const form = useAppForm({
    defaultValues: {
      field: defaultValue,
    },
  });

  // `children` is passed straight through as `AppField`'s render prop (an
  // identifier, not an inline function) so it is re-invoked on each field-state
  // change. It ignores the `field` arg — the field components read context themselves.
  const content = <form.AppField name="field">{children}</form.AppField>;

  return highlightChanges
    ? (
      <FieldChangeHighlightContext.Provider value={true}>
        {content}
      </FieldChangeHighlightContext.Provider>
    )
    : (
      content
    );
}
