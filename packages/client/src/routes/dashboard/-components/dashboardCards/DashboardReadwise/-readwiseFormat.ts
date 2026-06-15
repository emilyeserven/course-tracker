export function readingTime(wordCount: number | null): string | null {
  if (!wordCount || wordCount <= 0) return null;
  // ~200 words per minute is the usual reading-speed estimate.
  return `${Math.max(1, Math.round(wordCount / 200))} min`;
}
