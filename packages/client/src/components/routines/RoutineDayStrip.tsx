import type { RoutineWeekday, RoutineWeekly } from "@emstack/types";

import { cn } from "@/lib/utils";

// Monday-first display order with single-letter labels.
const DAY_STRIP: { day: RoutineWeekday;
  letter: string; }[] = [
  {
    day: "1",
    letter: "M",
  },
  {
    day: "2",
    letter: "T",
  },
  {
    day: "3",
    letter: "W",
  },
  {
    day: "4",
    letter: "T",
  },
  {
    day: "5",
    letter: "F",
  },
  {
    day: "6",
    letter: "S",
  },
  {
    day: "0",
    letter: "S",
  },
];

interface RoutineDayStripProps {
  weekly: RoutineWeekly | null | undefined;
}

// The M-T-W-T-F-S-S dot strip in a routine card's footer: one circle per
// weekday, filled when that day has a scheduled entry.
export function RoutineDayStrip({
  weekly,
}: RoutineDayStripProps) {
  const scheduledCount = weekly
    ? Object.values(weekly).filter(Boolean).length
    : 0;

  return (
    <div
      className="flex flex-row gap-1"
      title={`${scheduledCount} day${scheduledCount === 1 ? "" : "s"} scheduled`}
    >
      {DAY_STRIP.map(({
        day, letter,
      }, index) => {
        const scheduled = !!weekly?.[day];
        return (
          <span
            key={`${day}-${index}`}
            className={cn(
              "flex size-5 items-center justify-center rounded-full text-xs",
              scheduled
                ? `
                  bg-blue-600 font-bold text-white
                  dark:bg-blue-700
                `
                : "bg-muted text-muted-foreground",
            )}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
}
