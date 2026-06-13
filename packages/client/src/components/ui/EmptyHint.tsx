import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Small italic muted text for an empty/placeholder hint, e.g. "No topic" or
 * "No connections". Pass children for the message and `className` to extend.
 * Pass `asChild` to render the styling onto a custom element (e.g. a block
 * `<p>`) instead of the default inline `<span>`.
 */
export function EmptyHint({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      className={cn("text-xs text-muted-foreground italic", className)}
      {...props}
    />
  );
}
