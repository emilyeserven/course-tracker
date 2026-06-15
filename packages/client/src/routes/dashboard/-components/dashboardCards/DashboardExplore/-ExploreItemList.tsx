import type { ExploreItem } from "@emstack/types";

import { useState } from "react";

import { Link } from "@tanstack/react-router";

import { cn } from "../DashboardCard/-cardKit";

// Two-line description with an inline toggle that expands the full text within
// the tile. Renders nothing when there's no description to show.
function ExploreItemDescription({
  description,
}: {
  description: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = description?.trim();
  if (!text) return null;

  return (
    <div className="text-xs text-muted-foreground">
      <p className={cn("whitespace-pre-wrap", !expanded && "line-clamp-2")}>
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        className="
          mt-0.5 font-medium text-primary underline-offset-2
          hover:underline
        "
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

export function ExploreItemList({
  items,
  showDomain,
}: {
  items: ExploreItem[];
  showDomain: boolean;
}) {
  return (
    <ul
      className="
        grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-2
      "
    >
      {items.map(item => (
        <li
          key={`${item.domainId}:${item.topicId}`}
          className="flex min-w-0 flex-col gap-1 rounded-md border p-2"
        >
          <div className="flex min-w-0 flex-col">
            <Link
              to="/topics/$id"
              params={{
                id: item.topicId,
              }}
              className="
                truncate font-medium
                hover:text-blue-600
              "
            >
              {item.topicName}
            </Link>
            {showDomain && (
              <span className="truncate text-xs text-muted-foreground">
                {item.domainTitle}
              </span>
            )}
          </div>
          <ExploreItemDescription description={item.description} />
        </li>
      ))}
    </ul>
  );
}
