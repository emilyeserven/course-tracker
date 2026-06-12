import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

interface EntityHeaderButtonProps {
  /** Target route path, e.g. "/providers/$id" or "/topics/$id/edit". */
  to: string;
  /** Route params forwarded to the link. */
  params: Record<string, string>;
  /** Button label, e.g. "View Provider" or "Edit Topic". */
  label: string;
  /** Trailing icon (EyeIcon for view, EditIcon for edit, …). */
  icon: ReactNode;
}

/**
 * Secondary header action button (e.g. "View Provider", "Edit Topic") shared by
 * the entity edit/detail PageHeaders.
 */
export function EntityHeaderButton({
  to,
  params,
  label,
  icon,
}: EntityHeaderButtonProps) {
  return (
    <Link
      to={to}
      params={params}
    >
      <Button variant="secondary">
        {label}
        {" "}
        {icon}
      </Button>
    </Link>
  );
}
