import { cn } from "@/lib/utils";

interface StatusCircleProps {
  /** Color/border/background classes (a status option's `circleClass`). */
  circleClass?: string;
  /** Centered icon node. */
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  highlight?: boolean;
  /** Drop the circle's border (border-0 over the base border-2). */
  noBorder?: boolean;
  title?: string;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StatusCircleProps["size"]>, string> = {
  sm: "size-6 [&_svg]:size-3",
  md: "size-8 [&_svg]:size-4",
  lg: "size-10 [&_svg]:size-5",
  xl: "size-12 [&_svg]:size-6",
};

/**
 * Presentational status circle: a `rounded-full` chip filled with caller-supplied
 * color classes and a centered icon. Feature-agnostic — callers pass a status
 * option's `circleClass`/`icon` rather than a status enum (see
 * `DailyStatusCircle` and `ModuleStatusControl`).
 */
export function StatusCircle({
  circleClass,
  icon,
  size = "md",
  highlight = false,
  noBorder = false,
  title,
  className,
}: StatusCircleProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2",
        SIZE_CLASSES[size],
        circleClass,
        highlight && "ring-2 ring-ring ring-offset-1 ring-offset-background",
        noBorder && "border-0",
        className,
      )}
    >
      {icon}
    </span>
  );
}
