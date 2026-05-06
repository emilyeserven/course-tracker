import type { DailyCompletionStatus } from "@emstack/types/src";

import {
  CheckIcon,
  CircleDashedIcon,
  CircleIcon,
  SparklesIcon,
} from "lucide-react";

export interface DailyStatusOption {
  value: DailyCompletionStatus;
  label: string;
  icon: React.ReactNode;
  circleClass: string;
}

export const DAILY_STATUS_OPTIONS: DailyStatusOption[] = [
  {
    value: "incomplete",
    label: "Incomplete",
    icon: <CircleIcon className="size-4" />,
    circleClass: "bg-muted text-muted-foreground border-muted-foreground/40",
  },
  {
    value: "touched",
    label: "Touched",
    icon: <CircleDashedIcon className="size-4" />,
    circleClass: "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200",
  },
  {
    value: "goal",
    label: "Goal",
    icon: <CheckIcon className="size-4" />,
    circleClass: "bg-emerald-100 text-emerald-800 border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  {
    value: "exceeded",
    label: "Exceeded",
    icon: <SparklesIcon className="size-4" />,
    circleClass: "bg-violet-100 text-violet-800 border-violet-500 dark:bg-violet-900/40 dark:text-violet-200",
  },
];

export function getDailyStatusOption(
  status: DailyCompletionStatus,
): DailyStatusOption {
  return (
    DAILY_STATUS_OPTIONS.find(o => o.value === status) ?? DAILY_STATUS_OPTIONS[0]
  );
}
