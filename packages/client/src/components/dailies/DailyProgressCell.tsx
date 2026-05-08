import type { Daily } from "@emstack/types/src";

import { InfinityIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { RadialProgress } from "@/components/ui/RadialProgress";

interface DailyProgressCellProps {
  daily: Daily;
}

export function DailyProgressCell({
  daily,
}: DailyProgressCellProps) {
  const course = daily.course;
  const taskProgress = daily.task?.progress;

  if (course) {
    const progressTotal = course.progressTotal ?? 0;
    const progressCurrent = course.progressCurrent ?? 0;
    const percent = progressTotal > 0
      ? Math.round((progressCurrent / progressTotal) * 100)
      : 0;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="
              inline-flex items-center justify-center rounded-sm
              hover:bg-muted
              focus-visible:ring-2 focus-visible:ring-ring
              focus-visible:outline-none
            "
            aria-label={`Course progress ${percent}%`}
          >
            <RadialProgress
              current={progressCurrent}
              total={progressTotal > 0 ? progressTotal : 1}
              size={20}
              strokeWidth={3}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-3"
          align="center"
        >
          <div className="flex flex-col gap-1 text-sm">
            <div className="font-medium">{course.name}</div>
            <div className="text-muted-foreground">
              {progressTotal > 0
                ? `${progressCurrent} / ${progressTotal} (${percent}%)`
                : `${progressCurrent} completed`}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (taskProgress) {
    const total = taskProgress.todosTotal + taskProgress.resourcesTotal;
    const done = taskProgress.todosComplete + taskProgress.resourcesUsed;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="
              inline-flex items-center justify-center rounded-sm
              hover:bg-muted
              focus-visible:ring-2 focus-visible:ring-ring
              focus-visible:outline-none
            "
            aria-label={`Task progress ${percent}%`}
          >
            <RadialProgress
              current={done}
              total={total > 0 ? total : 1}
              size={20}
              strokeWidth={3}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-3"
          align="center"
        >
          <div className="flex flex-col gap-1 text-sm">
            <div className="font-medium">
              {daily.task?.name ?? "Task progress"}
            </div>
            <div className="text-muted-foreground">
              {total > 0
                ? `${done} / ${total} (${percent}%)`
                : "No to-dos or resources yet"}
            </div>
            <div className="mt-1 flex flex-col gap-0.5 text-xs">
              <span>
                ToDo&apos;s:
                {" "}
                <strong>
                  {taskProgress.todosComplete}
                  {" "}
                  /
                  {" "}
                  {taskProgress.todosTotal}
                </strong>
              </span>
              <span>
                Resources used:
                {" "}
                <strong>
                  {taskProgress.resourcesUsed}
                  {" "}
                  /
                  {" "}
                  {taskProgress.resourcesTotal}
                </strong>
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <span
      className="inline-flex text-muted-foreground"
      title="No linked progress"
    >
      <InfinityIcon className="size-5" />
    </span>
  );
}
