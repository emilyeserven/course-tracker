import type {
  Module,
  ModuleGroup,
  TaskResource,
} from "@emstack/types";

import { useState } from "react";

import { Loader2, Trash2Icon } from "lucide-react";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";

export const COLUMN_COUNT = 8;

export interface LinkOptionResource {
  id: string;
  name: string;
}

export function EditingRow({
  resource,
  resourceOptions,
  allModuleGroups,
  allModules,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  resource: TaskResource;
  resourceOptions: LinkOptionResource[];
  allModuleGroups: ModuleGroup[];
  allModules: Module[];
  isNew?: boolean;
  isSaving?: boolean;
  onSave: (next: TaskResource) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<TaskResource>(resource);

  function update(patch: Partial<TaskResource>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(draft);
  }

  const groupsForResource = draft.resourceId
    ? allModuleGroups.filter(g => g.resourceId === draft.resourceId)
    : [];
  const modulesForRow = !draft.resourceId
    ? []
    : draft.moduleGroupId
      ? allModules.filter(
        m =>
          m.resourceId === draft.resourceId
          && m.moduleGroupId === draft.moduleGroupId,
      )
      : allModules.filter(m => m.resourceId === draft.resourceId);

  return (
    <tr className="border-t bg-muted/30 align-top">
      <td
        colSpan={COLUMN_COUNT}
        className="p-3"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          <div
            className="
              grid grid-cols-1 gap-3
              md:grid-cols-2
            "
          >
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="resource-name"
              >
                Name
              </label>
              <Input
                id="resource-name"
                type="text"
                value={draft.name}
                onChange={e =>
                  update({
                    name: e.target.value,
                  })}
                required={!draft.resourceId}
                placeholder={
                  draft.resourceId
                    ? "Optional — falls back to linked name"
                    : "Resource name"
                }
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="resource-url"
              >
                Location (optional)
              </label>
              <Input
                id="resource-url"
                type="text"
                value={draft.url ?? ""}
                onChange={e =>
                  update({
                    url: e.target.value,
                  })}
                placeholder="A URL or location description"
              />
            </div>
          </div>
          <fieldset
            className="
              flex flex-col gap-2 rounded-md border border-border/60 p-2
            "
          >
            <legend className="px-1 text-xs font-medium text-muted-foreground">
              Resource Link (optional)
            </legend>
            <p className="px-1 text-xs text-muted-foreground/80">
              When linked, ease/time/interactivity/tags come from the linked
              Resource, Module Group, or Module — edit them on those pages.
            </p>
            <div
              className="
                grid grid-cols-1 gap-2
                md:grid-cols-3
              "
            >
              <select
                aria-label="Resource"
                value={draft.resourceId ?? ""}
                onChange={(e) => {
                  const nextId = e.target.value || null;
                  update({
                    resourceId: nextId,
                    moduleGroupId:
                      nextId === draft.resourceId ? draft.moduleGroupId : null,
                    moduleId:
                      nextId === draft.resourceId ? draft.moduleId : null,
                  });
                }}
                className="
                  flex h-9 w-full rounded-md border bg-background px-2 text-sm
                "
              >
                <option value="">— No link —</option>
                {resourceOptions.map(c => (
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
                value={draft.moduleGroupId ?? ""}
                onChange={(e) => {
                  const nextGroupId = e.target.value || null;
                  update({
                    moduleGroupId: nextGroupId,
                    moduleId:
                      draft.moduleId
                      && nextGroupId
                      && !allModules.some(
                        m =>
                          m.id === draft.moduleId
                          && m.moduleGroupId === nextGroupId,
                      )
                        ? null
                        : draft.moduleId,
                  });
                }}
                disabled={!draft.resourceId || groupsForResource.length === 0}
                className="
                  flex h-9 w-full rounded-md border bg-background px-2 text-sm
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
                value={draft.moduleId ?? ""}
                onChange={e =>
                  update({
                    moduleId: e.target.value || null,
                  })}
                disabled={!draft.resourceId || modulesForRow.length === 0}
                className="
                  flex h-9 w-full rounded-md border bg-background px-2 text-sm
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
            </div>
          </fieldset>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.usedYet}
              onChange={e =>
                update({
                  usedYet: e.target.checked,
                })}
              className="size-4"
            />
            <span>Used yet?</span>
          </label>
          <div
            className="
              flex flex-row flex-wrap items-center justify-between gap-2
            "
          >
            <div className="flex flex-row gap-2">
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="animate-spin" />}
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
            {onDelete && !isNew && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isSaving}
              >
                <Trash2Icon className="size-4" />
                Remove
              </Button>
            )}
          </div>
        </form>
      </td>
    </tr>
  );
}
