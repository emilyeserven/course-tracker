import { cn } from "@/lib/utils";

/**
 * An em-dash placeholder for an absent value (empty table cells, missing
 * fields). Muted by default; pass `className` to adjust (e.g. `text-xs`).
 */
export function EmptyDash({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      —
    </span>
  );
}
