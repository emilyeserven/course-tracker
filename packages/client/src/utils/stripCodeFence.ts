// Strip a surrounding Markdown code fence (```lang ... ```) and return the inner
// content. If the input isn't fenced, returns it trimmed.
export function stripCodeFence(input: string): string {
  const trimmed = input.trim();
  const fenceMatch = trimmed.match(/^```[^\n]*\n([\s\S]*?)\n?```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}
