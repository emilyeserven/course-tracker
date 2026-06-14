import type { ModuleStatus } from "@emstack/types";

import { useState } from "react";

import {
  getModuleStatusOption,
  MODULE_STATUS_OPTIONS,
} from "./moduleStatusMeta";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A module's status as a clickable circle (reusing the routine/daily status
 * circle visuals) that opens a popover to pick one of the three statuses.
 * Clicks are kept from bubbling so it never triggers the row's open-details
 * handler.
 */
export function ModuleStatusControl({
  status,
  disabled = false,
  onChange,
}: {
  status: ModuleStatus;
  disabled?: boolean;
  onChange: (status: ModuleStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = getModuleStatusOption(status);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={e => e.stopPropagation()}
          aria-label={`Status: ${current.label}. Change status`}
          title={`Status: ${current.label}`}
          className={cn(
            `
              inline-flex size-6 shrink-0 items-center justify-center
              rounded-full border-2
              [&_svg]:size-4
            `,
            current.circleClass,
            disabled && "opacity-50",
          )}
        >
          {current.icon}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-44 p-1"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          {MODULE_STATUS_OPTIONS.map((opt) => {
            const isActive = opt.value === status;
            return (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                aria-pressed={isActive}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "justify-start gap-2",
                  isActive && cn("border", opt.pillClass),
                )}
              >
                {opt.icon}
                {opt.label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
