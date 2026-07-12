import type { RoutineReferenceItem } from "@emstack/types";

import { routineEntryName } from "@emstack/types";
import { MapPinIcon } from "lucide-react";

import { OpenBookmarkPageButton } from "@/components/bookmarks";
import { EntityLink } from "@/components/boxElements";
import { ActionableSentence } from "@/components/dailies/ActionableSentence";
import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";

interface RoutineEntryLabelProps {
  entry: RoutineReferenceItem;
  taskNames: Map<string, string>;
  // When true (default), render the full presentation: a leading TYPE badge plus
  // any notes/location. When false, render only the actionable sentence (compact
  // form used inline, e.g. inside a Day Entries row).
  showMeta?: boolean;
}

// Renders a routine's per-day reference item (task / bookmark / freeform) as an
// actionable sentence, resolving the task name from the supplied map and linking
// task entries to their detail pages.
export function RoutineEntryLabel({
  entry,
  taskNames,
  showMeta = true,
}: RoutineEntryLabelProps) {
  const {
    resolveHref,
  } = useBookmarkLinking();

  // The entry's name as a clickable link (task) or plain text (freeform) — no
  // type badge, so it can sit inside an actionable sentence.
  function renderName() {
    if (entry.type === "freeform") {
      return entry.id;
    }
    if (entry.type === "bookmark") {
      // External bookmark: link out (honoring the click preference), cached title
      // + section, plus a shortcut to its Simple Bookmarks page.
      const linkable = {
        externalId: entry.id,
        url: entry.url ?? null,
      };
      return (
        <>
          <a
            href={resolveHref(linkable) ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="
              text-blue-800
              hover:text-blue-600
              dark:text-blue-300
            "
          >
            {entry.title ?? entry.id}
            {entry.sectionLabel ? ` › ${entry.sectionLabel}` : ""}
          </a>
          <OpenBookmarkPageButton
            linkable={linkable}
            className="ml-1 align-middle"
          />
        </>
      );
    }
    return (
      <EntityLink
        entity="tasks"
        id={entry.id}
        className="
          text-blue-800
          hover:text-blue-600
          dark:text-blue-300
        "
      >
        {routineEntryName(entry, taskNames)}
      </EntityLink>
    );
  }

  const nameNode = renderName();

  const actionable = (
    <ActionableSentence
      prependText={entry.prependText}
      appendText={entry.appendText}
      name={nameNode}
    />
  );

  if (!showMeta) {
    return actionable;
  }

  const main = (
    <span className="text-sm">
      <span className="mr-2 text-xs text-muted-foreground uppercase">
        {entry.type}
      </span>
      {actionable}
    </span>
  );

  if (!entry.notes && !entry.location) {
    return main;
  }

  return (
    <span className="flex flex-col gap-0.5">
      {main}
      {entry.notes && (
        <span className="text-sm text-muted-foreground">{entry.notes}</span>
      )}
      {entry.location && (
        <span
          className="
            inline-flex items-center gap-1 text-xs text-muted-foreground
          "
        >
          <MapPinIcon className="size-3.5 shrink-0" />
          {entry.location}
        </span>
      )}
    </span>
  );
}
