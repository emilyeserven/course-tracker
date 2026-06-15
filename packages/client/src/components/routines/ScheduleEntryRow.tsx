import type { WeeklyEntry, WeeklyRowType } from "./weekly";
import type { SelectOption } from "@/utils";

import { buildActionableSentence, resourceEntryLabel } from "@emstack/types";

import { ModuleNarrowingFields } from "@/components/routines/ModuleNarrowingFields";
import { TaskResourceComboboxContent } from "@/components/routines/TaskResourceComboboxContent";
import {
  effectiveEntryUrl,
  withLocationAutofill,
} from "@/components/routines/weekly";
import { Combobox, ComboboxInput } from "@/components/ui/combobox";

interface ScheduleEntryRowProps {
  // Displayed label for the row (e.g. "Monday" or "Mon, Jun 15").
  label: string;
  // Prefix for the row's aria-labels (kept stable so tests/stories can target
  // e.g. "Monday type").
  ariaPrefix: string;
  row: WeeklyEntry;
  taskOptions: SelectOption[];
  resourceOptions: SelectOption[];
  // Module groups / modules belonging to the row's currently-chosen resource.
  // Empty unless the entry is a resource with a populated module hierarchy.
  groupOptions: SelectOption[];
  moduleOptions: SelectOption[];
  onChange: (patch: Partial<WeeklyEntry>) => void;
  // Open the "add resource" dialog targeting this row.
  onAddResource: () => void;
  // Surface the combobox's typed text so the parent can seed the add dialog.
  onInputValueChange: (val: string) => void;
}

// The resolved item name and its actionable-sentence preview for a row, pulled
// out of the component to keep its complexity down. A resource entry's narrowing
// (module/group) name replaces the resource name in the label (see
// resourceEntryLabel); the preview only shows once there's prepend/append text.
function rowPreview(
  row: WeeklyEntry,
  optionsMap: Map<string, string>,
  groupOptions: SelectOption[],
  moduleOptions: SelectOption[],
): { showPreview: boolean;
  preview: string; } {
  const moduleLabel = row.moduleId
    ? moduleOptions.find(o => o.value === row.moduleId)?.label
    : null;
  const groupLabel = row.moduleGroupId
    ? groupOptions.find(o => o.value === row.moduleGroupId)?.label
    : null;
  const itemName
    = row.type === "freeform"
      ? row.id
      : row.type === "resource"
        ? resourceEntryLabel({
          resourceName: optionsMap.get(row.id) ?? "",
          moduleName: moduleLabel,
          groupName: groupLabel,
        })
        : (optionsMap.get(row.id) ?? "");
  return {
    showPreview:
      !!itemName && (!!row.prependText.trim() || !!row.appendText.trim()),
    preview: buildActionableSentence({
      prependText: row.prependText,
      name: itemName,
      appendText: row.appendText,
    }),
  };
}

// One schedule row's editor: type select, task/resource picker (or freeform
// input), an optional module-group/module narrowing for resource entries, then
// optional notes / location / prepend / append with a live preview. Shared by
// WeeklyScheduleField (per weekday) and CuratedScheduleField (per date).
export function ScheduleEntryRow({
  label,
  ariaPrefix,
  row,
  taskOptions,
  resourceOptions,
  groupOptions,
  moduleOptions,
  onChange,
  onAddResource,
  onInputValueChange,
}: ScheduleEntryRowProps) {
  const itemOptions
    = row.type === "task"
      ? taskOptions
      : row.type === "resource"
        ? resourceOptions
        : [];
  const optionsMap = new Map(itemOptions.map(o => [o.value, o.label]));
  // Item name + live preview (a resource entry's narrowing name replaces the
  // resource name); derived in a helper to keep this component's complexity down.
  const {
    showPreview,
    preview,
  } = rowPreview(row, optionsMap, groupOptions, moduleOptions);
  // The module narrowing only makes sense once a resource is chosen, and only
  // when that resource actually has modules / groups to pick from.
  const showModulePickers
    = row.type === "resource"
      && !!row.id
      && (groupOptions.length > 0 || moduleOptions.length > 0);

  // The most-specific link for the current resource / module / group selection,
  // and whether to offer applying it (a link exists and the location differs).
  const linkUrl = effectiveEntryUrl(
    row,
    resourceOptions,
    groupOptions,
    moduleOptions,
  );
  const showLinkOffer = !!linkUrl && row.location !== linkUrl;

  // Apply a selection-changing patch, autofilling the location from the new
  // selection's link (see withLocationAutofill). Only routed through the
  // type-determining controls (resource picker / module narrowing); the location
  // input itself keeps the plain onChange so typed text is never clobbered.
  const applyWithAutofill = (patch: Partial<WeeklyEntry>) =>
    onChange(
      withLocationAutofill(
        row,
        patch,
        resourceOptions,
        groupOptions,
        moduleOptions,
      ),
    );

  return (
    <li
      className="
        flex flex-col gap-1.5 rounded-md border bg-background px-2 py-1.5
      "
    >
      <div className="grid grid-cols-[110px_140px_1fr] items-center gap-2">
        <span className="text-sm font-medium">{label}</span>

        <select
          aria-label={`${ariaPrefix} type`}
          value={row.type}
          onChange={(e) => {
            // Changing the type clears the chosen item (different option set),
            // any module narrowing, and any note/location.
            onChange({
              type: e.target.value as WeeklyRowType,
              id: "",
              moduleId: "",
              moduleGroupId: "",
              notes: "",
              location: "",
            });
          }}
          className="
            flex h-9 w-full rounded-md border bg-background px-2 text-sm
          "
        >
          <option value="">— None —</option>
          <option value="task">Task</option>
          <option value="resource">Resource</option>
          <option value="freeform">Freeform</option>
        </select>

        {row.type === "freeform"
          ? (
            <input
              aria-label={`${ariaPrefix} description`}
              value={row.id}
              onChange={e =>
                onChange({
                  id: e.target.value,
                })}
              placeholder="Describe the activity…"
              className="
                flex h-9 w-full rounded-md border bg-background px-2 text-sm
              "
            />
          )
          : (
            <Combobox
              items={itemOptions.map(o => o.value)}
              value={row.id || null}
              onValueChange={val =>
                // A different resource has different modules, so clear any
                // existing narrowing when the picked item changes. Autofill the
                // location from the newly-picked resource's link when possible.
                applyWithAutofill({
                  id: val ?? "",
                  moduleId: "",
                  moduleGroupId: "",
                })}
              onInputValueChange={val => onInputValueChange(val)}
              itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
            >
              <ComboboxInput
                placeholder={
                  row.type === "task"
                    ? "Search tasks..."
                    : row.type === "resource"
                      ? "Search resources..."
                      : "Pick a type first"
                }
                showClear
                disabled={!row.type}
              />
              <TaskResourceComboboxContent
                optionsMap={optionsMap}
                onAddNew={row.type === "resource" ? onAddResource : undefined}
              />
            </Combobox>
          )}
      </div>

      {showModulePickers && (
        <ModuleNarrowingFields
          ariaPrefix={ariaPrefix}
          row={row}
          groupOptions={groupOptions}
          moduleOptions={moduleOptions}
          onChange={applyWithAutofill}
        />
      )}

      {row.type !== "" && (
        <>
          <input
            aria-label={`${ariaPrefix} notes`}
            value={row.notes}
            onChange={e =>
              onChange({
                notes: e.target.value,
              })}
            placeholder="Notes (optional)…"
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
          <input
            aria-label={`${ariaPrefix} location`}
            value={row.location}
            onChange={e =>
              onChange({
                location: e.target.value,
              })}
            placeholder="Location (e.g. gym, Spanish app, or a URL)…"
            className="
              flex h-9 w-full rounded-md border bg-background px-2 text-sm
            "
          />
          {showLinkOffer && (
            <button
              type="button"
              aria-label={`${ariaPrefix} use resource link`}
              onClick={() =>
                onChange({
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
              aria-label={`${ariaPrefix} prepend text`}
              value={row.prependText}
              onChange={e =>
                onChange({
                  prependText: e.target.value,
                })}
              placeholder="Prepend text (e.g. Review)…"
              className="
                flex h-9 w-full rounded-md border bg-background px-2 text-sm
              "
            />
            <input
              aria-label={`${ariaPrefix} append text`}
              value={row.appendText}
              onChange={e =>
                onChange({
                  appendText: e.target.value,
                })}
              placeholder="Append text (e.g. for 10 minutes)…"
              className="
                flex h-9 w-full rounded-md border bg-background px-2 text-sm
              "
            />
          </div>
          {showPreview && (
            <p className="px-0.5 text-sm text-muted-foreground">
              Preview:
              {" "}
              <span className="text-foreground">{preview}</span>
            </p>
          )}
        </>
      )}
    </li>
  );
}
