import type { DailyCompletionStatus } from "@emstack/types/src";

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleSlashIcon,
  SnowflakeIcon,
  SparklesIcon,
} from "lucide-react";

export interface DailyStatusOption {
  value: DailyCompletionStatus;
  label: string;
  icon: React.ReactNode;
  circleClass: string;
  pillClass: string;
  borderColor: string;
}

export const DAILY_STATUS_OPTIONS: DailyStatusOption[] = [
  {
    value: "incomplete",
    label: "Incomplete",
    icon: <CircleDashedIcon className="size-4" />,
    circleClass: "bg-muted text-muted-foreground border-muted-foreground/40",
    pillClass: "bg-muted text-muted-foreground border-muted-foreground/40",
    borderColor: "rgb(115 115 115 / 0.4)",
  },
  {
    value: "touched",
    label: "Touched",
    icon: <CircleSlashIcon className="size-4" />,
    circleClass: "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200",
    pillClass: "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200",
    borderColor: "#fbbf24",
  },
  {
    value: "goal",
    label: "Goal",
    icon: <CircleCheckIcon className="size-4" />,
    circleClass: "bg-emerald-100 text-emerald-800 border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-200",
    pillClass: "bg-emerald-100 text-emerald-800 border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-200",
    borderColor: "#10b981",
  },
  {
    value: "exceeded",
    label: "Exceeded",
    icon: <SparklesIcon className="size-4" />,
    circleClass: "bg-violet-100 text-violet-800 border-violet-500 shadow-[0_0_8px_2px_rgba(139,92,246,0.5)] dark:bg-violet-900/40 dark:text-violet-200 dark:shadow-[0_0_8px_2px_rgba(167,139,250,0.55)]",
    pillClass: "bg-violet-100 text-violet-800 border-violet-500 shadow-[0_0_6px_1px_rgba(139,92,246,0.45)] dark:bg-violet-900/40 dark:text-violet-200 dark:shadow-[0_0_6px_1px_rgba(167,139,250,0.5)]",
    borderColor: "#8b5cf6",
  },
  {
    value: "freeze",
    label: "Freeze",
    icon: <SnowflakeIcon className="size-4" />,
    circleClass: "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-900/30 dark:text-sky-200",
    pillClass: "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-900/30 dark:text-sky-200",
    borderColor: "#7dd3fc",
  },
];

export function getDailyStatusOption(
  status: DailyCompletionStatus,
): DailyStatusOption {
  return (
    DAILY_STATUS_OPTIONS.find(o => o.value === status) ?? DAILY_STATUS_OPTIONS[0]
  );
}
