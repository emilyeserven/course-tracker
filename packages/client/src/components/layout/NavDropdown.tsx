import { Link } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHoverPopover } from "@/hooks/useHoverPopover";

interface NavDropdownProps {
  label: string;
  to?: React.ComponentProps<typeof Link>["to"];
  children: React.ReactNode;
}

export function NavDropdown({
  label, to, children,
}: NavDropdownProps) {
  const {
    open, setOpen, handleOpen, handleClose,
  } = useHoverPopover({
    closeDelay: 400,
  });

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
          {to
            ? (
              <Link
                to={to}
                className={`
                  underline-offset-2
                  hover:underline
                  [&.active]:font-bold
                `}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            )
            : (
              <span>{label}</span>
            )}
          <span
            aria-label={`Open ${label} menu`}
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
        align="start"
        side="bottom"
        sideOffset={0}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
