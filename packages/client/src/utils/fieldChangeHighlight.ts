import { createContext, useContext } from "react";

import { useFieldContext } from "@/utils/fieldContext";

/**
 * Whether the enclosing form should highlight fields whose value differs from
 * their original (default) value. Defaults to `false` so the shared field
 * components stay inert on every page that does not opt in.
 */
export const FieldChangeHighlightContext = createContext(false);

/**
 * Tailwind classes applied to a field whose current value differs from its
 * original. A subtle tint with horizontal breathing room (negative margin
 * cancels the padding) so toggling it never shifts the form layout.
 */
export const changedFieldClass = "-mx-3 rounded-md bg-primary/10 px-3";

/**
 * True when the enclosing form opted into highlighting AND the current field's
 * value differs from its default. Relies on TanStack Form's built-in
 * `isDefaultValue` meta, which (unlike the sticky `isDirty`) flips back to true
 * when the user reverts a field to its original value.
 */
export function useFieldChangeHighlight(): boolean {
  const enabled = useContext(FieldChangeHighlightContext);
  const field = useFieldContext<unknown>();
  return enabled && !field.state.meta.isDefaultValue;
}
