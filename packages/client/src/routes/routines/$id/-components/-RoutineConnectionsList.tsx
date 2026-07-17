import type { RoutineConnection } from "@emstack/types";

import { OpenBookmarkPageButton } from "@/components/bookmarks";
import { EntityLink } from "@/components/boxElements";
import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";
import { connectionEntityKind } from "@/utils";

interface RoutineConnectionsListProps {
  connections: RoutineConnection[];
}

const linkClass = `
  font-bold text-blue-800
  hover:text-blue-600
  dark:text-blue-300
`;

// The "Connected To" list on a routine's Details tab: bookmark connections
// link out to Simple Bookmarks (with optional section suffix), local
// connections link to their entity page.
export function RoutineConnectionsList({
  connections,
}: RoutineConnectionsListProps) {
  const {
    resolveHref,
  } = useBookmarkLinking();

  return (
    <ul className="flex flex-col gap-1">
      {connections.map(c => (
        <li key={`${c.type}:${c.id}`}>
          {c.type === "bookmark"
            ? (
              <span className="inline-flex items-center gap-1">
                <a
                  href={
                    resolveHref({
                      externalId: c.id,
                      url: c.url ?? null,
                    }) ?? undefined
                  }
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  <span
                    className="mr-2 text-xs text-muted-foreground uppercase"
                  >
                    {c.type}
                  </span>
                  {c.name ?? c.id}
                  {c.sectionLabel && (
                    <span className="ml-1 font-normal opacity-70">
                      › {c.sectionLabel}
                    </span>
                  )}
                </a>
                <OpenBookmarkPageButton
                  linkable={{
                    externalId: c.id,
                    url: c.url ?? null,
                  }}
                />
              </span>
            )
            : (
              <EntityLink
                entity={connectionEntityKind(c.type)}
                id={c.id}
                className={linkClass}
              >
                <span
                  className="mr-2 text-xs text-muted-foreground uppercase"
                >
                  {c.type}
                </span>
                {c.name ?? c.id}
              </EntityLink>
            )}
        </li>
      ))}
    </ul>
  );
}
