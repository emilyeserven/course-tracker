import { useCallback, useRef, useState } from "react";

import { Link } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavDropdownProps {
  label: string;
  to: React.ComponentProps<typeof Link>["to"];
  children: React.ReactNode;
}

export function NavDropdown({
  label, to, children,
}: NavDropdownProps) {
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
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <DropdownMenu
        open={open}
        onOpenChange={setOpen}
      >
        <DropdownMenuTrigger asChild>
          <span className="inline-flex items-center gap-0.5">
            <Link
              to={to}
              className={`
                underline-offset-2
                hover:underline
                [&.active]:font-bold
              `}
            >
              {label}
            </Link>
            <ChevronDownIcon className="size-3.5" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">{children}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
