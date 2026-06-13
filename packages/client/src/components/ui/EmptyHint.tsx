import { cn } from "@/lib/utils";

/**
 * Small italic muted text for an empty/placeholder hint, e.g. "No topic" or
 * "No connections". Pass children for the message and `className` to extend.
 */
export function EmptyHint({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-xs text-muted-foreground italic", className)}
      {...props}
    />
  );
}
