// Combine optional prepend / append text around an item name into a single
// natural sentence (e.g. "Review" + "Spanish flashcards" + "for 10 minutes" ->
// "Review Spanish flashcards for 10 minutes"). Blank parts are trimmed away, so
// a name with no prepend/append simply returns the name.
export function buildActionableSentence(parts: {
  prependText?: string | null;
  name: string;
  appendText?: string | null;
}): string {
  return [parts.prependText, parts.name, parts.appendText]
    .map(s => (s ?? "").trim())
    .filter(Boolean)
    .join(" ");
}
