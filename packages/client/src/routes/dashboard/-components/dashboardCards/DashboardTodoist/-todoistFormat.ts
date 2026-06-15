// Todoist priority is 1–4 with 4 the most urgent (shown as "P1" in the app).
// Only the two highest priorities get a coloured dot; the rest stay muted.
export function priorityDotClass(priority: number): string {
  if (priority >= 4) return "bg-red-500";
  if (priority === 3) return "bg-orange-500";
  return "bg-muted-foreground/40";
}
