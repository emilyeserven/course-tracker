import type { WeeklyEntry } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";

import { useMemo } from "react";

import { buildActionableSentence } from "@emstack/types";

export interface WeeklyEntryEditorProps extends WeeklyEntry {
  onChange: (next: WeeklyEntry) => void;
  taskOptions: SelectOption[];
}

/**
 * State + derivations for -WeeklyEntryEditor: the active option list and its
 * value→label map, the `emit` patch helper that preserves the unedited fields,
 * and the actionable-sentence preview. Lifted out so the editor component is a
 * thin composer over its leaves.
 */
export function useWeeklyEntryEditor({
  type,
  id,
  notes,
  location,
  prependText,
  appendText,
  title,
  url,
  sectionId,
  sectionLabel,
  onChange,
  taskOptions,
}: WeeklyEntryEditorProps) {
  const itemOptions = type === "task" ? taskOptions : [];
  const optionsMap = useMemo(
    () => new Map(itemOptions.map(o => [o.value, o.label])),
    [itemOptions],
  );

  function emit(patch: Partial<WeeklyEntry>) {
    onChange({
      type,
      id,
      notes,
      location,
      prependText,
      appendText,
      title,
      url,
      sectionId,
      sectionLabel,
      ...patch,
    });
  }

  const itemName
    = type === "freeform"
      ? id
      : type === "bookmark"
        ? title || id
        : (optionsMap.get(id) ?? "");
  const showPreview
    = !!itemName && (!!prependText.trim() || !!appendText.trim());
  const preview = buildActionableSentence({
    prependText,
    name: itemName,
    appendText,
  });

  return {
    itemOptions,
    optionsMap,
    emit,
    showPreview,
    preview,
  };
}
