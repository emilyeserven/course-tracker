import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DropdownNavItemProps {
  to: React.ComponentProps<typeof Link>["to"];
  children: ReactNode;
  className?: string;
}

/** A dropdown menu entry that links to a route — used across the nav menus. */
export function DropdownNavItem({
  to,
  children,
  className = "cursor-pointer",
}: DropdownNavItemProps) {
  return (
    <DropdownMenuItem
      asChild
      className={className}
    >
      <Link to={to}>{children}</Link>
    </DropdownMenuItem>
  );
}
