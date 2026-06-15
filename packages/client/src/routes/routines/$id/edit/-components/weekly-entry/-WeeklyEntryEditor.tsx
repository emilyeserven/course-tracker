import type { WeeklyEntryEditorProps } from "./-useWeeklyEntryEditor";

import { ActionableSentencePreview } from "./-ActionableSentencePreview";
import { TaskResourceFreeformPicker } from "./-TaskResourceFreeformPicker";
import {
  useWeeklyEntryEditor,

} from "./-useWeeklyEntryEditor";

import { QuickAddResourceDialog } from "@/components/dialogs/quickAdd/QuickAddResourceDialog";

// A single task / resource / freeform picker — the same control the weekly grid
// uses per day, but standalone for Daily Task mode (the chosen entry is applied
// to every weekday). Also carries the optional note and prepend/append text that
// build the daily's actionable sentence. A thin composer over its leaves; state
// and derivations live in -useWeeklyEntryEditor.
export function WeeklyEntryEditor(props: WeeklyEntryEditorProps) {
  const {
    type, id, notes, location, prependText, appendText,
  } = props;
  const {
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
  } = useWeeklyEntryEditor(props);

  return (
    <div
      className="
        flex flex-col gap-1.5 rounded-md border bg-background px-2 py-1.5
      "
    >
      <TaskResourceFreeformPicker
        type={type}
        id={id}
        itemOptions={itemOptions}
        optionsMap={optionsMap}
        onEmit={emit}
        onInputValueChange={setInputValue}
        onRequestAddResource={() => setAddOpen(true)}
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
            // Show the resource link as a placeholder rather than baking it into
            // the value, so a blank field reads as "uses the resource link".
            value={location === linkUrl ? "" : location}
            onChange={e =>
              emit({
                location: e.target.value,
              })}
            placeholder={
              linkUrl || "Location (e.g. gym, Spanish app, or a URL)…"
            }
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
          {linkUrl && location !== "" && location !== linkUrl && (
            <button
              type="button"
              aria-label="Daily task use resource link"
              onClick={() =>
                emit({
                  location: linkUrl,
                })}
              className="
                self-start text-xs text-primary underline-offset-2
                hover:underline
              "
            >
              Use link from resource
            </button>
          )}
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

      <QuickAddResourceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initialName={inputValue}
        onCreated={newId =>
          emit({
            id: newId,
          })}
      />
    </div>
  );
}
