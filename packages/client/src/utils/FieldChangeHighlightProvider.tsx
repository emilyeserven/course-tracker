import { FieldChangeHighlightContext } from "@/utils/fieldChangeHighlight";

/**
 * Opts a form subtree into per-field change highlighting. Wrap the form whose
 * modified fields should be visually flagged. `enabled` lets callers disable it
 * (e.g. when creating a new entity, which has no original values to diff).
 */
export function FieldChangeHighlightProvider({
  enabled = true,
  children,
}: {
  enabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <FieldChangeHighlightContext.Provider value={enabled}>
      {children}
    </FieldChangeHighlightContext.Provider>
  );
}
