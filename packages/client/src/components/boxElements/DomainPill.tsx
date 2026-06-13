import { cn } from "@/lib/utils";

type DomainPillProps = React.ComponentProps<"span">;

/** Static (non-link) domain chip used in topic boxes and the topics table. */
export function DomainPill({
  className,
  children,
  ...props
}: DomainPillProps) {
  return (
    <span
      className={cn(
        "rounded-sm bg-gray-100 px-2 py-0.5 text-xs text-gray-700",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
