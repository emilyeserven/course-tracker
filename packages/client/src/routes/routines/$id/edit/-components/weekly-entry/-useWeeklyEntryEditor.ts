import type { WeeklyEntry } from "@/components/routines/weekly";
import type { SelectOption } from "@/utils";

import { useMemo, useState } from "react";

import { buildActionableSentence } from "@emstack/types";

import { effectiveEntryUrl } from "@/components/routines/weekly";

export interface WeeklyEntryEditorProps extends WeeklyEntry {
  onChange: (next: WeeklyEntry) => void;
  taskOptions: SelectOption[];
  resourceOptions: SelectOption[];
}

/**
 * State + derivations for -WeeklyEntryEditor: the active option list and its
 * value→label map, the inline add-resource dialog state, the `emit` patch helper
 * that preserves the unedited fields, and the actionable-sentence preview. Lifted
 * out so the editor component is a thin composer over its leaves.
 */
export function useWeeklyEntryEditor({
  type,
  id,
  // Daily mode doesn't expose the module narrowing (Curated/Weekly only), but the
  // fields are part of WeeklyEntry, so carry them through unchanged.
  moduleId,
  moduleGroupId,
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
  resourceOptions,
}: WeeklyEntryEditorProps) {
  const itemOptions
    = type === "task" ? taskOptions : type === "resource" ? resourceOptions : [];
  const optionsMap = useMemo(
    () => new Map(itemOptions.map(o => [o.value, o.label])),
    [itemOptions],
  );

  // Inline "Add resource" modal (only offered for the resource type).
  const [addOpen, setAddOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  function emit(patch: Partial<WeeklyEntry>) {
    onChange({
      type,
      id,
      moduleId,
      moduleGroupId,
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

  // Daily mode has no module narrowing, so the entry's link is just the chosen
  // resource's url (empty for task / freeform). Shown as the location input's
  // placeholder and persisted on save when the field is left blank.
  const linkUrl = effectiveEntryUrl(
    {
      type,
      id,
      moduleId,
      moduleGroupId,
    },
    resourceOptions,
    [],
    [],
  );

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
    addOpen,
    setAddOpen,
    inputValue,
    setInputValue,
    emit,
    linkUrl,
    showPreview,
    preview,
  };
}
