import type { ComponentProps, ReactNode } from "react";

import { Link } from "@tanstack/react-router";

export type EntityKind
  = | "resources"
    | "topics"
    | "providers"
    | "domains"
    | "tasks"
    | "routines";

const TO_BY_KIND: Record<EntityKind, string> = {
  resources: "/resources/$id",
  topics: "/topics/$id",
  providers: "/providers/$id",
  domains: "/domains/$id",
  tasks: "/tasks/$id",
  routines: "/routines/$id",
};

/** Shared "chip" styling for an entity link rendered as a pill — used by
 *  TaskBox, RoutineBox connection chips, and TopicList's pill mode. */
export const PILL_LINK_CLASS
  = "rounded-sm bg-gray-50 px-2 py-0.5 text-xs hover:bg-gray-900 hover:text-white";

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
