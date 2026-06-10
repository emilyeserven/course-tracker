import type { Daily } from "@emstack/types/src";

import { ActionableSentence } from "./ActionableSentence";

// The action name (the assigned task/resource/freeform the routine points at,
// with any prepend/append affixes) on top, and the routine's own title beneath
// it in smaller, de-emphasized text. The subtitle shows only when the title is
// derived from an assigned item AND differs from the routine name, so an
// unassigned daily — or one whose assigned name equals its routine name — stays
// a single line.
export function DailyTitle({
  daily,
}: {
  daily: Daily;
}) {
  const routineTitle = daily.name;
  const showRoutineSubtitle
    = daily.actionParts != null && daily.actionParts.name !== routineTitle;
  return (
    <span className="flex flex-col">
      <ActionableSentence
        prependText={daily.actionParts?.prependText}
        appendText={daily.actionParts?.appendText}
        name={daily.actionParts?.name ?? routineTitle}
      />
      {showRoutineSubtitle && (
        <span className="text-xs font-normal text-muted-foreground">
          {routineTitle}
        </span>
      )}
    </span>
  );
}
