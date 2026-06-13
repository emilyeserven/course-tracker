import type { QuickAddKey } from "./quickAddOptions";

import { useCallback, useRef, useState } from "react";

import { ChevronDownIcon } from "lucide-react";

import { QUICK_ADD_OPTIONS } from "./quickAddOptions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuickAddMenuProps {
  onSelect: (key: QuickAddKey) => void;
}

/**
 * Desktop nav dropdown for Quick Add. Mirrors NavDropdown's hover-to-open
 * behaviour and trigger styling, but its items open modals (via `onSelect`)
 * rather than navigating.
 */
export function QuickAddMenu({
  onSelect,
}: QuickAddMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    closeTimeout.current = setTimeout(() => setOpen(false), 400);
  }, []);

  const external = QUICK_ADD_OPTIONS.filter(o => o.group === "external");
  const tracker = QUICK_ADD_OPTIONS.filter(o => o.group === "tracker");

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="
            inline-flex cursor-pointer items-center gap-0.5 outline-none
          "
        >
          <span
            className="
              underline-offset-2
              hover:underline
            "
          >
            Quick Add
          </span>
          <span
            aria-label="Open Quick Add menu"
            role="button"
            className="
              inline-flex size-5 items-center justify-center rounded-sm
              text-muted-foreground
              hover:bg-accent hover:text-accent-foreground
            "
          >
            <ChevronDownIcon className="size-3.5" />
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenuLabel>Send to</DropdownMenuLabel>
        {external.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.key}
              className="cursor-pointer"
              onSelect={() => onSelect(option.key)}
            >
              <Icon />
              {option.label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>New record</DropdownMenuLabel>
        {tracker.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.key}
              className="cursor-pointer"
              onSelect={() => onSelect(option.key)}
            >
              <Icon />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
