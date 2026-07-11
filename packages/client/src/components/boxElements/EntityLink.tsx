import type { ComponentProps, ReactNode } from "react";

import { Link } from "@tanstack/react-router";

export type EntityKind = "resources" | "providers" | "tasks" | "routines";

const TO_BY_KIND: Record<EntityKind, string> = {
  resources: "/resources/$id",
  providers: "/providers/$id",
  tasks: "/tasks/$id",
  routines: "/routines/$id",
};

interface EntityLinkProps extends Pick<
  ComponentProps<"a">,
  "title" | "aria-label"
> {
  entity: EntityKind;
  id: string | number;
  className?: string;
  children: ReactNode;
}

export function EntityLink({
  entity,
  id,
  className = "hover:text-blue-600",
  children,
  ...props
}: EntityLinkProps) {
  return (
    <Link
      to={TO_BY_KIND[entity]}
      params={{
        id: String(id),
      }}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}
