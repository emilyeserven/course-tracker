import type { WeeklyEntry, WeeklyRowType } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";

import { ScheduleItemControl } from "@/components/routines/ScheduleItemControl";

interface TaskResourceFreeformPickerProps {
  type: WeeklyRowType;
  id: string;
  // Bookmark entries only: cached title/url + optional section narrowing.
  title: string;
  url: string;
  sectionId: string;
  sectionLabel: string;
  itemOptions: SelectOption[];
  optionsMap: Map<string, string>;
  onEmit: (patch: Partial<WeeklyEntry>) => void;
  onInputValueChange: (val: string) => void;
  onRequestAddResource: () => void;
}

// The type selector + item picker row for Daily-mode: the value control is the
// shared ScheduleItemControl (task/resource combobox, bookmark picker, or
// freeform input). Internal to -WeeklyEntryEditor.
export function TaskResourceFreeformPicker({
  type,
  id,
  title,
  url,
  sectionId,
  sectionLabel,
  itemOptions,
  optionsMap,
  onEmit,
  onInputValueChange,
  onRequestAddResource,
}: TaskResourceFreeformPickerProps) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
      <select
        aria-label="Daily task type"
        value={type}
        onChange={e =>
          // Changing the type clears the chosen item (different option set)
          // and any note/location/prepend/append/bookmark fields.
          onEmit({
            type: e.target.value as WeeklyRowType,
            id: "",
            notes: "",
            location: "",
            prependText: "",
            appendText: "",
            title: "",
            url: "",
            sectionId: "",
            sectionLabel: "",
          })}
        className="flex h-9 w-full rounded-md border bg-background px-2 text-sm"
      >
        <option value="">— None —</option>
        <option value="task">Task</option>
        <option value="resource">Resource</option>
        <option value="bookmark">Bookmark</option>
        <option value="freeform">Freeform</option>
      </select>

      <ScheduleItemControl
        ariaPrefix="Daily task"
        type={type}
        id={id}
        title={title}
        url={url}
        sectionId={sectionId}
        sectionLabel={sectionLabel}
        itemOptions={itemOptions}
        optionsMap={optionsMap}
        onChange={onEmit}
        onInputValueChange={onInputValueChange}
        onAddResource={onRequestAddResource}
      />
    </div>
  );
}
