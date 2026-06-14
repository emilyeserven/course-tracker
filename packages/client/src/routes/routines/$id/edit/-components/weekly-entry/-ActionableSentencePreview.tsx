// The "Preview: …" line showing the resolved actionable sentence built from the
// entry's prepend/append text. Internal to -WeeklyEntryEditor.
export function ActionableSentencePreview({
  preview,
}: { preview: string }) {
  return (
    <p className="px-0.5 text-sm text-muted-foreground">
      Preview:
      {" "}
      <span className="text-foreground">{preview}</span>
    </p>
  );
}
