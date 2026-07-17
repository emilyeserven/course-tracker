import type { RoutineConnection } from "@emstack/types";

import { Fragment } from "react";

import { OpenBookmarkPageButton } from "@/components/bookmarks";
import { EntityLink } from "@/components/boxElements";
import { Badge } from "@/components/ui/badge";
import { EmptyHint } from "@/components/ui/EmptyHint";
import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";
import { connectionEntityKind } from "@/utils";

interface RoutineConnectionBadgesProps {
  connections: RoutineConnection[] | null | undefined;
}

// The connection badge row in a routine card's header: bookmark connections
// link out to Simple Bookmarks (plus the open-page button), local connections
// link to their entity page. Empty → "No connections" hint.
export function RoutineConnectionBadges({
  connections,
}: RoutineConnectionBadgesProps) {
  const {
    resolveHref,
  } = useBookmarkLinking();

  if (!connections || connections.length === 0) {
    return <EmptyHint>No connections</EmptyHint>;
  }

  return (
    <>
      {connections.map(c => (
        <Fragment key={`${c.type}:${c.id}`}>
          <Badge
            asChild
            variant="secondary"
            className="
              bg-muted
              hover:bg-primary hover:text-primary-foreground
            "
          >
            {c.type === "bookmark"
              ? (
                <a
                  href={
                    resolveHref({
                      externalId: c.id,
                      url: c.url ?? null,
                    }) ?? undefined
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.name ?? c.id}
                  {c.sectionLabel ? ` › ${c.sectionLabel}` : ""}
                </a>
              )
              : (
                <EntityLink
                  entity={connectionEntityKind(c.type)}
                  id={c.id}
                >
                  {c.name ?? c.id}
                </EntityLink>
              )}
          </Badge>
          {c.type === "bookmark" && (
            <OpenBookmarkPageButton
              linkable={{
                externalId: c.id,
                url: c.url ?? null,
              }}
            />
          )}
        </Fragment>
      ))}
    </>
  );
}
