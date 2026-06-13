import type { RoutineReferenceItem } from "@emstack/types";

import { MapPinIcon } from "lucide-react";

import { EntityLink } from "@/components/boxElements";
import { ActionableSentence } from "@/components/dailies/ActionableSentence";

interface RoutineEntryLabelProps {
  entry: RoutineReferenceItem;
  taskNames: Map<string, string>;
  resourceNames: Map<string, string>;
  // When true (default), render the full presentation: a leading TYPE badge plus
  // any notes/location. When false, render only the actionable sentence (compact
  // form used inline, e.g. inside a Day Entries row).
  showMeta?: boolean;
}

// Renders a routine's per-day reference item (task / resource / freeform) as an
// actionable sentence, resolving the task/resource name from the supplied maps
// and linking task/resource entries to their detail pages.
export function RoutineEntryLabel({
  entry,
  taskNames,
  resourceNames,
  showMeta = true,
}: RoutineEntryLabelProps) {
  // The entry's name as a clickable link (task / resource) or plain text
  // (freeform) — no type badge, so it can sit inside an actionable sentence.
  const nameNode = entry.type === "freeform"
    ? entry.id
    : (
      <EntityLink
        entity={entry.type === "task" ? "tasks" : "resources"}
        id={entry.id}
        className="
          text-blue-800
          hover:text-blue-600
          dark:text-blue-300
        "
      >
        {entry.type === "task"
          ? (taskNames.get(entry.id) ?? entry.id)
          : (resourceNames.get(entry.id) ?? entry.id)}
      </EntityLink>
    );

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
