import type { Module, ModuleGroup } from "@emstack/types/src";

import { useMemo } from "react";

import { PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ResourceLinkInput {
  // Stable per-row key. Existing rows keep their server-assigned id;
  // new rows get a local key so React reconciles correctly.
  key: string;
  resourceId: string;
  moduleGroupId: string | null;
  moduleId: string | null;
}

interface ResourceSummary {
  id: string;
  name: string;
}

interface ResourceLinksPickerProps {
  value: ResourceLinkInput[];
  onChange: (next: ResourceLinkInput[]) => void;
  courses: ResourceSummary[];
  moduleGroups: ModuleGroup[];
  modules: Module[];
}

let localKeyCounter = 0;
function nextLocalKey() {
  localKeyCounter += 1;
  return `local-${localKeyCounter}`;
}

function newResourceLinkRow(): ResourceLinkInput {
  return {
    key: nextLocalKey(),
    resourceId: "",
    moduleGroupId: null,
    moduleId: null,
  };
}

export function ResourceLinksPicker({
  value,
  onChange,
  courses,
  moduleGroups,
  modules,
}: ResourceLinksPickerProps) {
  const courseOptions = useMemo(
    () => [...courses].sort((a, b) => a.name.localeCompare(b.name)),
    [courses],
  );

  function update(index: number, patch: Partial<ResourceLinkInput>) {
    const next = value.slice();
    next[index] = {
      ...next[index],
      ...patch,
    };
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...value, newResourceLinkRow()]);
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 && (
        <p className="text-muted-foreground text-xs">
          No resource links yet.
        </p>
      )}
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((row, index) => {
            const groupsForResource = row.resourceId
              ? moduleGroups.filter(g => g.resourceId === row.resourceId)
              : [];
            // Modules to show in the dropdown:
            //   - if a moduleGroup is selected, show only modules in that group
            //   - else show all modules for the selected resource (any group / ungrouped)
            //   - else (no resource selected), show none
            const modulesForRow = !row.resourceId
              ? []
              : row.moduleGroupId
                ? modules.filter(
                  m =>
                    m.resourceId === row.resourceId
                    && m.moduleGroupId === row.moduleGroupId,
                )
                : modules.filter(m => m.resourceId === row.resourceId);
            return (
              <li
                key={row.key}
                className="
                  bg-background grid grid-cols-[1fr_1fr_1fr_auto] items-center
                  gap-2 rounded-md border px-2 py-1.5
                "
              >
                <select
                  aria-label="Resource"
                  value={row.resourceId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    update(index, {
                      resourceId: nextId,
                      // Clear sub-targets if the resource changed
                      moduleGroupId: nextId === row.resourceId
                        ? row.moduleGroupId
                        : null,
                      moduleId: nextId === row.resourceId ? row.moduleId : null,
                    });
                  }}
                  className="
                    bg-background flex h-9 w-full rounded-md border px-2 text-sm
                  "
                >
                  <option value="">— Select a resource —</option>
                  {courseOptions.map(c => (
                    <option
                      key={c.id}
                      value={c.id}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Module Group"
                  value={row.moduleGroupId ?? ""}
                  onChange={(e) => {
                    const nextGroupId = e.target.value || null;
                    update(index, {
                      moduleGroupId: nextGroupId,
                      // If the currently selected module isn't in this new
                      // group, clear it.
                      moduleId: row.moduleId
                        && nextGroupId
                        && !modules.some(
                          m =>
                            m.id === row.moduleId
                            && m.moduleGroupId === nextGroupId,
                        )
                        ? null
                        : row.moduleId,
                    });
                  }}
                  disabled={!row.resourceId || groupsForResource.length === 0}
                  className="
                    bg-background flex h-9 w-full rounded-md border px-2 text-sm
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                >
                  <option value="">— Any group —</option>
                  {groupsForResource.map(g => (
                    <option
                      key={g.id}
                      value={g.id}
                    >
                      {g.name}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Module"
                  value={row.moduleId ?? ""}
                  onChange={e =>
                    update(index, {
                      moduleId: e.target.value || null,
                    })}
                  disabled={!row.resourceId || modulesForRow.length === 0}
                  className="
                    bg-background flex h-9 w-full rounded-md border px-2 text-sm
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                >
                  <option value="">— Any module —</option>
                  {modulesForRow.map(m => (
                    <option
                      key={m.id}
                      value={m.id}
                    >
                      {m.name}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  aria-label="Remove link"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={courses.length === 0}
        >
          <PlusIcon className="size-3.5" />
          Add Resource Link
        </Button>
      </div>
    </div>
  );
}
