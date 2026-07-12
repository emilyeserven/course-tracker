import type { Daily } from "@emstack/types";

import { InfinityIcon } from "lucide-react";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { RadialProgress } from "@/components/ui/RadialProgress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHoverPopover } from "@/hooks/useHoverPopover";

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
  const {
    open, setOpen, cancelClose, handleOpen, handleClose,
  }
    = useHoverPopover();

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
  const bookmarkProgress = daily.bookmarkProgress;

  // Bookmark reading progress takes precedence: when the daily's active
  // bookmark tracks real progress in Simple Bookmarks (a positive total), show
  // how far through the material we are instead of the task's to-do completion.
  // A zero/absent total is not real progress, so fall through to the infinity
  // icon rather than render an empty ring.
  if (bookmarkProgress && bookmarkProgress.total > 0) {
    const {
      current, total, title,
    } = bookmarkProgress;
    const percent = Math.round((current / total) * 100);
    return (
      <HoverProgressPopover
        ariaLabel={`Bookmark progress ${percent}%`}
        current={current}
        total={total}
      >
        <div className="flex flex-col gap-1 text-sm">
          <div className="font-medium">{title}</div>
          <div className="text-muted-foreground">
            {`${current} / ${total} (${percent}%)`}
          </div>
        </div>
      </HoverProgressPopover>
    );
  }

  const taskProgress = daily.task?.progress;

  if (taskProgress) {
    const total = taskProgress.todosTotal;
    const done = taskProgress.todosComplete;
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
            {total > 0 ? `${done} / ${total} (${percent}%)` : "No to-dos yet"}
          </div>
          <div className="mt-1 flex flex-col gap-0.5 text-xs">
            <span>
              ToDo&apos;s:
              {" "}
              <strong>
                {taskProgress.todosComplete} / {taskProgress.todosTotal}
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
