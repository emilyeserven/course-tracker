import type { TagGroup, TaskResourceLevel } from "@emstack/types";

import { LevelTriad } from "./LevelTriad";
import { lookupTagsByIds } from "./moduleDrafts";

import { TagPicker } from "@/components/tasks/TagPicker";

export interface LevelAndTagsValue {
  easeOfStarting: TaskResourceLevel | "";
  timeNeeded: TaskResourceLevel | "";
  interactivity: TaskResourceLevel | "";
  tagIds: string[];
}

/**
 * The shared "effort levels + tag picker" fields rendered at the bottom of the
 * module and module-group edit cards. Both cards back these onto a draft with
 * the same shape, so they share this block.
 */
export function LevelAndTagsFields({
  draft,
  tagGroups,
  onChange,
}: {
  draft: LevelAndTagsValue;
  tagGroups: TagGroup[];
  onChange: (patch: Partial<LevelAndTagsValue>) => void;
}) {
  return (
    <>
      <LevelTriad
        easeOfStarting={draft.easeOfStarting}
        timeNeeded={draft.timeNeeded}
        interactivity={draft.interactivity}
        onChange={patch => onChange(patch)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Tags
        </label>
        <TagPicker
          value={draft.tagIds}
          onChange={ids =>
            onChange({
              tagIds: lookupTagsByIds(ids, tagGroups).map(t => t.id),
            })}
          tagGroups={tagGroups}
          placeholder={
            tagGroups.length > 0
              ? "Pick tags..."
              : "No tags configured. Add some on the Settings page."
          }
        />
      </div>
    </>
  );
}
