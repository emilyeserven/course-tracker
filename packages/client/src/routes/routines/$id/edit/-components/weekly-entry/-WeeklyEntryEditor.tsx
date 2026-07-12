import type { WeeklyEntryEditorProps } from "./-useWeeklyEntryEditor";

import { ActionableSentencePreview } from "./-ActionableSentencePreview";
import { TaskResourceFreeformPicker } from "./-TaskResourceFreeformPicker";
import { useWeeklyEntryEditor } from "./-useWeeklyEntryEditor";

// A single task / bookmark / freeform picker — the same control the weekly grid
// uses per day, but standalone for Daily Task mode (the chosen entry is applied
// to every weekday). Also carries the optional note and prepend/append text that
// build the daily's actionable sentence. A thin composer over its leaves; state
// and derivations live in -useWeeklyEntryEditor.
export function WeeklyEntryEditor(props: WeeklyEntryEditorProps) {
  const {
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
  } = props;
  const {
    itemOptions, optionsMap, emit, showPreview, preview,
  }
    = useWeeklyEntryEditor(props);

  return (
    <div
      className="
        flex flex-col gap-1.5 rounded-md border bg-background px-2 py-1.5
      "
    >
      <TaskResourceFreeformPicker
        type={type}
        id={id}
        title={title}
        url={url}
        sectionId={sectionId}
        sectionLabel={sectionLabel}
        itemOptions={itemOptions}
        optionsMap={optionsMap}
        onEmit={emit}
      />

      {type !== "" && (
        <>
          <input
            aria-label="Daily task notes"
            value={notes}
            onChange={e =>
              emit({
                notes: e.target.value,
              })}
            placeholder="Notes (optional)…"
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
          <input
            aria-label="Daily task location"
            value={location}
            onChange={e =>
              emit({
                location: e.target.value,
              })}
            placeholder="Location (e.g. gym, Spanish app, or a URL)…"
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
          <div
            className="
              grid grid-cols-1 gap-1.5
              sm:grid-cols-2
            "
          >
            <input
              aria-label="Prepend text"
              value={prependText}
              onChange={e =>
                emit({
                  prependText: e.target.value,
                })}
              placeholder="Prepend text (e.g. Review)…"
              className="
                flex h-9 w-full rounded-md border bg-background px-2 text-sm
              "
            />
            <input
              aria-label="Append text"
              value={appendText}
              onChange={e =>
                emit({
                  appendText: e.target.value,
                })}
              placeholder="Append text (e.g. for 10 minutes)…"
              className="
                flex h-9 w-full rounded-md border bg-background px-2 text-sm
              "
            />
          </div>
          {showPreview && <ActionableSentencePreview preview={preview} />}
        </>
      )}
    </div>
  );
}
