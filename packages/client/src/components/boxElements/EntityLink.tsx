import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

type EntityKind = "resources" | "topics" | "providers" | "domains" | "tasks";

const TO_BY_KIND: Record<EntityKind, string> = {
  resources: "/resources/$id",
  topics: "/topics/$id",
  providers: "/providers/$id",
  domains: "/domains/$id",
  tasks: "/tasks/$id",
};

interface EntityLinkProps {
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
}: EntityLinkProps) {
  return (
    <Link
      to={TO_BY_KIND[entity]}
      params={{
        id: String(id),
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
