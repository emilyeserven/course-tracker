import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DomainPillProps = React.ComponentProps<typeof Badge>;

/** Static (non-link) domain chip used in topic boxes and the topics table. */
export function DomainPill({
  className,
  children,
  ...props
}: DomainPillProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-sm bg-muted font-normal text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Badge>
  );
}
