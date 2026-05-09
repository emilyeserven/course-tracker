import type { DailyCompletionStatus } from "@emstack/types/src";

import { cn } from "@/lib/utils";

import { getDailyStatusOption } from "./dailyStatusMeta";

interface DailyStatusCircleProps {
  status: DailyCompletionStatus | null;
  size?: "sm" | "md" | "lg" | "xl";
  highlight?: boolean;
  title?: string;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<DailyStatusCircleProps["size"]>, string> = {
  sm: "size-6 [&_svg]:size-3",
  md: "size-8 [&_svg]:size-4",
  lg: "size-10 [&_svg]:size-5",
  xl: "size-12 [&_svg]:size-6",
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
            border-muted-foreground/40 text-muted-foreground/60 border-dashed
            bg-transparent
          `,
        highlight && "ring-ring ring-offset-background ring-2 ring-offset-1",
        className,
      )}
    >
      {option?.icon}
    </span>
  );
}
