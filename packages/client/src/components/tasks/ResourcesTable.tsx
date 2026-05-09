import type {
  Module,
  ModuleGroup,
  Task,
  TaskResource,
  TaskResourceLevel,
} from "@emstack/types/src";

import { Fragment, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ActivityIcon,
  ExternalLinkIcon,
  Loader2,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { getResourceLevelClass, getResourceLevelLabel } from "./resourceMeta";

import { InteractionQuickLog } from "@/components/courses/InteractionQuickLog";
import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  fetchModuleGroups,
  fetchModules,
  fetchResources,
  isHttpUrl,
  upsertTask,
} from "@/utils";
import { uuidv4 } from "@/utils/uuid";

interface ResourcesTableProps {
  task: Task;
}

const ANY_VALUE = "__any";
const COLUMN_COUNT = 8;

type ResourceLevelKey = "easeOfStarting" | "timeNeeded" | "interactivity";

// The ease/time/interactivity values live on Resource / ModuleGroup / Module.
// Resolve from most-specific to least-specific:
//   Module → its parent ModuleGroup → Resource.
// When the row narrows to a Module that doesn't carry an override, walk up
// to the module's parent group (looked up via allModules/allModuleGroups
// since the row's joined moduleGroup may be null when only a module was
// selected) and then to the resource.
function inheritedLevel(
  resource: TaskResource,
  key: ResourceLevelKey,
  allModules: Module[],
  allModuleGroups: ModuleGroup[],
): TaskResourceLevel | null {
  const fromModule = resource.module?.[key];
  if (fromModule) return fromModule;

  if (resource.moduleId) {
    const fullModule = allModules.find(m => m.id === resource.moduleId);
    if (fullModule?.moduleGroupId) {
      const parentGroup = allModuleGroups.find(
        g => g.id === fullModule.moduleGroupId,
      );
      const fromParent = parentGroup?.[key];
      if (fromParent) return fromParent;
    }
  }

  const fromRowGroup = resource.moduleGroup?.[key];
  if (fromRowGroup) return fromRowGroup;

  return resource.resource?.[key] ?? null;
}

function LevelBadge({
  level,
}: {
  level: TaskResourceLevel | null | undefined;
}) {
  return (
    <span
      className={cn(
        `
          inline-flex items-center rounded-full border px-2 py-0.5 text-xs
          font-medium
        `,
        getResourceLevelClass(level),
      )}
    >
      {getResourceLevelLabel(level)}
    </span>
  );
}

interface LinkOptionResource {
  id: string;
  name: string;
}

function EditingRow({
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

export function ResourcesTable({
  task,
}: ResourcesTableProps) {
  const queryClient = useQueryClient();
  const resources = task.resources ?? [];

  const {
    data: courses,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchResources(),
  });
  const {
    data: allModuleGroups,
  } = useQuery({
    queryKey: ["module-groups-all"],
    queryFn: () => fetchModuleGroups(),
  });
  const {
    data: allModules,
  } = useQuery({
    queryKey: ["modules-all"],
    queryFn: () => fetchModules(),
  });
  const resourceOptions = useMemo(
    () =>
      [...(courses ?? [])]
        .map(c => ({
          id: c.id,
          name: c.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [courses],
  );

  const [search, setSearch] = useState("");
  const [usedFilter, setUsedFilter] = useState<string>(ANY_VALUE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNewResource, setDraftNewResource] = useState<TaskResource | null>(
    null,
  );
  const [loggingFor, setLoggingFor] = useState<string | null>(null);

  const editingResource = useMemo(
    () => resources.find(r => r.id === editingId) ?? null,
    [resources, editingId],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return resources.filter((r) => {
      if (term) {
        const haystack = `${r.name} ${r.url ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (usedFilter === "used" && !r.usedYet) return false;
      if (usedFilter === "not-used" && r.usedYet) return false;
      return true;
    });
  }, [resources, search, usedFilter]);

  const mutation = useMutation({
    mutationFn: (next: TaskResource[]) =>
      upsertTask(task.id, {
        name: task.name,
        description: task.description ?? null,
        topicId: task.topicId ?? null,
        taskTypeId: task.taskTypeId ?? null,
        resources: next.map(r => ({
          id: r.id,
          name: r.name,
          url: r.url ?? null,
          usedYet: r.usedYet,
          resourceId: r.resourceId ?? null,
          moduleGroupId: r.resourceId ? (r.moduleGroupId ?? null) : null,
          moduleId: r.resourceId ? (r.moduleId ?? null) : null,
        })),
        todos: (task.todos ?? []).map(t => ({
          id: t.id,
          name: t.name,
          isComplete: t.isComplete,
          url: t.url ?? null,
        })),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["task", task.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dailies"],
        }),
      ]);
    },
    onError: () => {
      toast.error("Failed to update resource.");
    },
  });

  function handleToggleUsed(resourceId: string, nextUsed: boolean) {
    const next = resources.map(r =>
      r.id === resourceId
        ? {
          ...r,
          usedYet: nextUsed,
        }
        : r);
    mutation.mutate(next);
  }

  function handleSaveEdit(updated: TaskResource) {
    const next = resources.map(r => (r.id === updated.id ? updated : r));
    mutation.mutate(next, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["task", task.id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["tasks"],
          }),
        ]);
        setEditingId(null);
      },
    });
  }

  function handleSaveNew(created: TaskResource) {
    const next = [...resources, created];
    mutation.mutate(next, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["task", task.id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["tasks"],
          }),
        ]);
        setDraftNewResource(null);
      },
    });
  }

  function handleDelete(id: string) {
    const next = resources.filter(r => r.id !== id);
    mutation.mutate(next, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["task", task.id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["tasks"],
          }),
        ]);
        setEditingId(null);
      },
    });
  }

  function startCreate() {
    setEditingId(null);
    setDraftNewResource({
      id: uuidv4(),
      taskId: task.id,
      name: "",
      url: "",
      usedYet: false,
      resourceId: null,
      moduleGroupId: null,
      moduleId: null,
    });
  }

  function startEdit(resourceId: string) {
    setDraftNewResource(null);
    setEditingId(resourceId);
  }

  const isAnyEditing
    = !!editingResource || !!draftNewResource || loggingFor !== null;

  if (resources.length === 0 && !draftNewResource) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          <i>No resources yet.</i>
        </p>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={startCreate}
          >
            <PlusIcon className="size-4" />
            Add Resource
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startCreate}
          disabled={isAnyEditing}
        >
          <PlusIcon className="size-4" />
          Add Resource
        </Button>
      </div>
      <div className="flex flex-col gap-3 rounded-md border bg-muted/20 p-3">
        <div
          className="
            flex flex-col flex-wrap gap-2
            md:flex-row md:items-end
          "
        >
          <div className="flex min-w-56 flex-1 flex-col gap-1">
            <label
              htmlFor="resource-search"
              className="text-xs font-medium text-muted-foreground"
            >
              Search
            </label>
            <div className="relative">
              <SearchIcon
                className="
                  absolute top-1/2 left-2 size-4 -translate-y-1/2
                  text-muted-foreground
                "
              />
              <Input
                id="resource-search"
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or location"
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Used
            </label>
            <Select
              value={usedFilter}
              onValueChange={setUsedFilter}
            >
              <SelectTrigger
                size="sm"
                aria-label="Filter by used"
                className="min-w-32"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VALUE}>Any</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="not-used">Not yet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="p-2 font-medium">Name</th>
              <th className="p-2 font-medium whitespace-nowrap">
                Ease of Starting
              </th>
              <th className="p-2 font-medium whitespace-nowrap">Time Needed</th>
              <th className="p-2 font-medium">Interactivity</th>
              <th className="p-2 font-medium whitespace-nowrap">Used yet?</th>
              <th className="p-2 font-medium">Location</th>
              <th
                className="w-24 p-2"
                colSpan={2}
              />
            </tr>
          </thead>
          <tbody>
            {draftNewResource && (
              <EditingRow
                key={draftNewResource.id}
                resource={draftNewResource}
                resourceOptions={resourceOptions}
                allModuleGroups={allModuleGroups ?? []}
                allModules={allModules ?? []}
                isNew
                isSaving={mutation.isPending}
                onSave={handleSaveNew}
                onCancel={() => setDraftNewResource(null)}
              />
            )}
            {filtered.length === 0 && !draftNewResource && (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="p-4 text-center text-muted-foreground"
                >
                  <i>No resources match these filters.</i>
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              if (r.id === editingId && editingResource) {
                return (
                  <EditingRow
                    key={r.id}
                    resource={editingResource}
                    resourceOptions={resourceOptions}
                    allModuleGroups={allModuleGroups ?? []}
                    allModules={allModules ?? []}
                    isSaving={mutation.isPending}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(r.id)}
                  />
                );
              }
              const locationIsUrl = !!r.url && isHttpUrl(r.url);
              const modulesList = allModules ?? [];
              const groupsList = allModuleGroups ?? [];
              const ease = inheritedLevel(
                r,
                "easeOfStarting",
                modulesList,
                groupsList,
              );
              const time = inheritedLevel(
                r,
                "timeNeeded",
                modulesList,
                groupsList,
              );
              const interactivity = inheritedLevel(
                r,
                "interactivity",
                modulesList,
                groupsList,
              );
              const canLogInteraction = !!r.resourceId;
              // Most-specific first: Module > Module Group > Resource.
              const linkedLabel = r.resource
                ? [r.module?.name, r.moduleGroup?.name, r.resource.name]
                  .filter(Boolean)
                  .join(" > ")
                : null;
              // When linked, the linked label IS the resource name. Show
              // the freeform name only if it adds something different.
              const showFreeformName
                = !!r.name && (!linkedLabel || r.name !== linkedLabel);
              return (
                <Fragment key={r.id}>
                  <tr
                    className="
                      group border-t align-middle
                      hover:bg-muted/40
                    "
                  >
                    <td className="p-2">
                      <div className="flex flex-col gap-0.5">
                        {linkedLabel && r.resourceId
                          ? (
                            <Link
                              to="/resources/$id"
                              params={{
                                id: r.resourceId,
                              }}
                              className="
                                font-medium
                                hover:text-blue-600
                              "
                              title={linkedLabel}
                            >
                              {linkedLabel}
                            </Link>
                          )
                          : (
                            <span className="font-medium">{r.name}</span>
                          )}
                        {linkedLabel && showFreeformName && (
                          <span className="text-xs text-muted-foreground">
                            {r.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <LevelBadge level={ease} />
                    </td>
                    <td className="p-2">
                      <LevelBadge level={time} />
                    </td>
                    <td className="p-2">
                      <LevelBadge level={interactivity} />
                    </td>
                    <td className="p-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={r.usedYet}
                          disabled={mutation.isPending || isAnyEditing}
                          onChange={e =>
                            handleToggleUsed(r.id, e.target.checked)}
                          className="size-4"
                          aria-label={`Mark ${r.name} as used`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {r.usedYet ? "Used" : "Not yet"}
                        </span>
                      </label>
                    </td>
                    <td className="max-w-xs p-2">
                      {r.url
                        ? (
                          locationIsUrl
                            ? (
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                >
                                  Go
                                  <ExternalLinkIcon className="size-3.5" />
                                </Button>
                              </a>
                            )
                            : (
                              <span
                                className="block truncate text-xs"
                                title={r.url}
                              >
                                {r.url}
                              </span>
                            )
                        )
                        : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                    </td>
                    <td className="p-2">
                      {canLogInteraction && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Log interaction for ${r.name}`}
                          title="Log interaction"
                          onClick={() => setLoggingFor(r.id)}
                          disabled={isAnyEditing}
                          className="
                            opacity-0 transition
                            group-hover:opacity-100
                            focus-visible:opacity-100
                          "
                        >
                          <ActivityIcon className="size-3.5" />
                        </Button>
                      )}
                    </td>
                    <td className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${r.name}`}
                        title="Edit resource"
                        onClick={() => startEdit(r.id)}
                        disabled={isAnyEditing}
                        className="
                          opacity-0 transition
                          group-hover:opacity-100
                          focus-visible:opacity-100
                        "
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                  {loggingFor === r.id && r.resourceId && (
                    <tr className="border-t bg-muted/30">
                      <td
                        colSpan={COLUMN_COUNT}
                        className="p-3"
                      >
                        <InteractionQuickLog
                          resourceId={r.resourceId}
                          moduleGroupId={r.moduleGroupId ?? null}
                          moduleId={r.moduleId ?? null}
                          scopeLabel={linkedLabel ?? r.name}
                          onCancel={() => setLoggingFor(null)}
                          onSaved={() => setLoggingFor(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
