import type { DailyCompletionStatus } from "@emstack/types";

import { getDailyStatusOption } from "./dailyStatusMeta";

import { StatusCircle } from "@/components/ui/StatusCircle";

interface DailyStatusCircleProps {
  status: DailyCompletionStatus | null;
  size?: "sm" | "md" | "lg" | "xl";
  highlight?: boolean;
  /** Drop the circle's border (e.g. when rendered inline/compact). */
  noBorder?: boolean;
  title?: string;
  className?: string;
}

/** Empty/no-entry circle (a null daily status has no option metadata). */
const EMPTY_CIRCLE_CLASS = `
  border-dashed border-muted-foreground/40 bg-transparent
  text-muted-foreground/60
`;

export function DailyStatusCircle({
  status,
  size = "md",
  highlight = false,
  noBorder = false,
  title,
  className,
}: DailyStatusCircleProps) {
  const option = status ? getDailyStatusOption(status) : null;

  return (
    <StatusCircle
      size={size}
      highlight={highlight}
      noBorder={noBorder}
      title={title}
      className={className}
      circleClass={option ? option.circleClass : EMPTY_CIRCLE_CLASS}
      icon={option?.icon}
    />
  );
}
