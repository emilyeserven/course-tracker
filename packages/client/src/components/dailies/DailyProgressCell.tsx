import type { Daily } from "@emstack/types/src";

import { useEffect, useRef, useState } from "react";

import { InfinityIcon } from "lucide-react";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/popover";
import { RadialProgress } from "@/components/ui/RadialProgress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DailyProgressCellProps {
  daily: Daily;
}

interface HoverProgressPopoverProps {
  ariaLabel: string;
  current: number;
  total: number;
  children: React.ReactNode;
}

function HoverProgressPopover({
  ariaLabel,
  current,
  total,
  children,
}: HoverProgressPopoverProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleOpen = () => {
    cancelClose();
    setOpen(true);
  };

  const handleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverAnchor asChild>
        <button
          type="button"
          className="
            inline-flex items-center justify-center rounded-sm
            hover:bg-muted
            focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:outline-none
          "
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            cancelClose();
            setOpen(prev => !prev);
          }}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          onFocus={handleOpen}
          onBlur={handleClose}
        >
          <RadialProgress
            current={current}
            total={total > 0 ? total : 1}
            size={20}
            strokeWidth={3}
          />
        </button>
      </PopoverAnchor>
      <PopoverContent
        className="w-auto p-3"
        align="center"
        onMouseEnter={cancelClose}
        onMouseLeave={handleClose}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
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
      <HoverProgressPopover
        ariaLabel={`Course progress ${percent}%`}
        current={progressCurrent}
        total={progressTotal}
      >
        <div className="flex flex-col gap-1 text-sm">
          <div className="font-medium">{course.name}</div>
          <div className="text-muted-foreground">
            {progressTotal > 0
              ? `${progressCurrent} / ${progressTotal} (${percent}%)`
              : `${progressCurrent} completed`}
          </div>
        </div>
      </HoverProgressPopover>
    );
  }

  if (taskProgress) {
    const total = taskProgress.todosTotal + taskProgress.resourcesTotal;
    const done = taskProgress.todosComplete + taskProgress.resourcesUsed;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
      <HoverProgressPopover
        ariaLabel={`Task progress ${percent}%`}
        current={done}
        total={total}
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
      </HoverProgressPopover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex text-muted-foreground">
          <InfinityIcon className="size-5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>Daily Drills</TooltipContent>
    </Tooltip>
  );
}
