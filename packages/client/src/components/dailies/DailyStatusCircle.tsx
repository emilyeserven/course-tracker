import type { DailyCompletionStatus } from "@emstack/types/src";

import { getDailyStatusOption } from "./dailyStatusMeta";

import { cn } from "@/lib/utils";

interface DailyStatusCircleProps {
  status: DailyCompletionStatus | null;
  size?: "sm" | "md" | "lg";
  highlight?: boolean;
  title?: string;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<DailyStatusCircleProps["size"]>, string> = {
  sm: "size-6 [&_svg]:size-3",
  md: "size-8 [&_svg]:size-4",
  lg: "size-10 [&_svg]:size-5",
};

export function DailyStatusCircle({
  status,
  size = "md",
  highlight = false,
  title,
  className,
}: DailyStatusCircleProps) {
  const option = status ? getDailyStatusOption(status) : null;

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2",
        SIZE_CLASSES[size],
        option
          ? option.circleClass
          : `
            border-dashed border-muted-foreground/40 bg-transparent
            text-muted-foreground/60
          `,
        highlight && "ring-2 ring-ring ring-offset-1 ring-offset-background",
        className,
      )}
    >
      {option?.icon}
    </span>
  );
}
