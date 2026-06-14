import type { QuickAddKey, QuickAddOption } from "./quickAddOptions";

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
import { useHoverPopover } from "@/hooks/useHoverPopover";

interface QuickAddMenuProps {
  onSelect: (key: QuickAddKey) => void;
}

/** Renders one group of Quick Add options as selectable dropdown items. */
function QuickAddGroup({
  options,
  onSelect,
}: {
  options: QuickAddOption[];
  onSelect: (key: QuickAddKey) => void;
}) {
  return options.map((option) => {
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
  });
}

/**
 * Desktop nav dropdown for Quick Add. Mirrors NavDropdown's hover-to-open
 * behaviour and trigger styling, but its items open modals (via `onSelect`)
 * rather than navigating.
 */
export function QuickAddMenu({
  onSelect,
}: QuickAddMenuProps) {
  const {
    open, setOpen, handleOpen, handleClose,
  } = useHoverPopover({
    closeDelay: 400,
  });

  const external = QUICK_ADD_OPTIONS.filter(o => o.group === "external");
  const tracker = QUICK_ADD_OPTIONS.filter(o => o.group === "tracker");

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <div
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
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
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <DropdownMenuLabel>Send to</DropdownMenuLabel>
        <QuickAddGroup
          options={external}
          onSelect={onSelect}
        />
        <DropdownMenuSeparator />
        <DropdownMenuLabel>New record</DropdownMenuLabel>
        <QuickAddGroup
          options={tracker}
          onSelect={onSelect}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
