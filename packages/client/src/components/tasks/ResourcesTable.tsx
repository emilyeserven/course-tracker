import type {
  Module,
  ModuleGroup,
  Tag,
  TagGroup,
  Task,
  TaskResource,
  TaskResourceLevel,
} from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLinkIcon,
  Loader2,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  getResourceLevelClass,
  getResourceLevelLabel,
  RESOURCE_LEVEL_OPTIONS,
} from "./resourceMeta";
import { TagChip } from "./TagChip";
import { TagPicker } from "./TagPicker";

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
  fetchTagGroups,
  isHttpUrl,
  upsertTask,
} from "@/utils";
import { uuidv4 } from "@/utils/uuid";

interface ResourcesTableProps {
  task: Task;
}

const ANY_VALUE = "__any";
const NONE_VALUE = "__none";
const COLUMN_COUNT = 8;

const LEVEL_FILTER_OPTIONS = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
  {
    value: NONE_VALUE,
    label: "None",
  },
] as const;

function LevelBadge({
  level,
}: {
  level: TaskResource["easeOfStarting"];
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

function levelMatches(
  resource: TaskResourceLevel | null | undefined,
  filter: string,
) {
  if (filter === ANY_VALUE) return true;
  if (filter === NONE_VALUE) return resource == null;
  return resource === filter;
}

function LevelFilter({
  value,
  onValueChange,
  ariaLabel,
}: {
  value: string;
  onValueChange: (next: string) => void;
  ariaLabel: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className="min-w-28"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY_VALUE}>Any</SelectItem>
        {LEVEL_FILTER_OPTIONS.map(opt => (
          <SelectItem
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LevelSelect({
  value,
  onValueChange,
  ariaLabel,
}: {
  value: TaskResourceLevel | null | undefined;
  onValueChange: (next: TaskResourceLevel | null) => void;
  ariaLabel: string;
}) {
  return (
    <Select
      value={value ?? NONE_VALUE}
      onValueChange={(v) => {
        onValueChange(v === NONE_VALUE ? null : (v as TaskResourceLevel));
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>—</SelectItem>
        {RESOURCE_LEVEL_OPTIONS.map(opt => (
          <SelectItem
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function tagIdsFromResource(resource: TaskResource) {
  return resource.tags.map(t => t.id);
}

function lookupTagsByIds(ids: string[], tagGroups: TagGroup[]): Tag[] {
  const byId = new Map<string, Tag>();
  for (const group of tagGroups) {
    for (const tag of group.tags ?? []) {
      byId.set(tag.id, tag);
    }
  }
  return ids
    .map(id => byId.get(id))
    .filter((t): t is Tag => t !== undefined);
}

interface LinkOptionResource {
  id: string;
  name: string;
}

function EditingRow({
  resource,
  tagGroups,
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
  tagGroups: TagGroup[];
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
                onChange={e => update({
                  name: e.target.value,
                })}
                required
                placeholder="Resource name"
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
                onChange={e => update({
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
                    // Reset sub-targets when the resource changes / clears
                    moduleGroupId: nextId === draft.resourceId
                      ? draft.moduleGroupId
                      : null,
                    moduleId: nextId === draft.resourceId
                      ? draft.moduleId
                      : null,
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
                    // Clear module if it no longer belongs to the selected group
                    moduleId: draft.moduleId
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
                onChange={e => update({
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
          <div
            className="
              grid grid-cols-1 gap-3
              md:grid-cols-3
            "
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Ease of Starting
              </label>
              <LevelSelect
                value={draft.easeOfStarting}
                onValueChange={v => update({
                  easeOfStarting: v,
                })}
                ariaLabel="Ease of starting"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Time Needed
              </label>
              <LevelSelect
                value={draft.timeNeeded}
                onValueChange={v => update({
                  timeNeeded: v,
                })}
                ariaLabel="Time needed"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Interactivity
              </label>
              <LevelSelect
                value={draft.interactivity}
                onValueChange={v => update({
                  interactivity: v,
                })}
                ariaLabel="Interactivity"
              />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.usedYet}
              onChange={e => update({
                usedYet: e.target.checked,
              })}
              className="size-4"
            />
            <span>Used yet?</span>
          </label>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Tags
            </label>
            <TagPicker
              value={tagIdsFromResource(draft)}
              onChange={ids => update({
                tags: lookupTagsByIds(ids, tagGroups),
              })}
              tagGroups={tagGroups}
              placeholder={tagGroups.length > 0
                ? "Pick tags..."
                : "No tags configured. Add some on the Settings page."}
            />
          </div>
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
    data: tagGroupsData,
  } = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => fetchTagGroups(),
  });
  const tagGroups = tagGroupsData ?? [];

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
  const [easeFilter, setEaseFilter] = useState<string>(ANY_VALUE);
  const [timeFilter, setTimeFilter] = useState<string>(ANY_VALUE);
  const [interactivityFilter, setInteractivityFilter] = useState<string>(ANY_VALUE);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNewResource, setDraftNewResource] = useState<TaskResource | null>(
    null,
  );

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
      if (!levelMatches(r.easeOfStarting, easeFilter)) return false;
      if (!levelMatches(r.timeNeeded, timeFilter)) return false;
      if (!levelMatches(r.interactivity, interactivityFilter)) return false;
      if (tagFilter.length > 0) {
        const resourceTagIds = new Set((r.tags ?? []).map(t => t.id));
        if (!tagFilter.every(id => resourceTagIds.has(id))) return false;
      }
      return true;
    });
  }, [resources, search, usedFilter, easeFilter, timeFilter, interactivityFilter, tagFilter]);

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
          easeOfStarting: r.easeOfStarting ?? null,
          timeNeeded: r.timeNeeded ?? null,
          interactivity: r.interactivity ?? null,
          usedYet: r.usedYet,
          tagIds: (r.tags ?? []).map(t => t.id),
          resourceId: r.resourceId ?? null,
          moduleGroupId: r.resourceId ? r.moduleGroupId ?? null : null,
          moduleId: r.resourceId ? r.moduleId ?? null : null,
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
      easeOfStarting: null,
      timeNeeded: null,
      interactivity: null,
      usedYet: false,
      resourceId: null,
      moduleGroupId: null,
      moduleId: null,
      tags: [],
    });
  }

  function startEdit(resourceId: string) {
    setDraftNewResource(null);
    setEditingId(resourceId);
  }

  const isAnyEditing = !!editingResource || !!draftNewResource;

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
          <div className="flex min-w-56 flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Tags
            </label>
            <TagPicker
              value={tagFilter}
              onChange={setTagFilter}
              tagGroups={tagGroups}
              placeholder="Filter by tag..."
            />
          </div>
        </div>
        <fieldset
          className="
            flex flex-col flex-wrap gap-2 rounded-md border border-border/60 p-2
            md:flex-row md:items-end
          "
        >
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            Properties
          </legend>
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Ease
            </label>
            <LevelFilter
              value={easeFilter}
              onValueChange={setEaseFilter}
              ariaLabel="Filter by ease of starting"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Time
            </label>
            <LevelFilter
              value={timeFilter}
              onValueChange={setTimeFilter}
              ariaLabel="Filter by time needed"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Interactivity
            </label>
            <LevelFilter
              value={interactivityFilter}
              onValueChange={setInteractivityFilter}
              ariaLabel="Filter by interactivity"
            />
          </div>
        </fieldset>
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
              <th className="p-2 font-medium">Tags</th>
              <th className="p-2 font-medium">Location</th>
              <th className="w-10 p-2" />
            </tr>
          </thead>
          <tbody>
            {draftNewResource && (
              <EditingRow
                key={draftNewResource.id}
                resource={draftNewResource}
                tagGroups={tagGroups}
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
                    tagGroups={tagGroups}
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
              return (
                <tr
                  key={r.id}
                  className="
                    group border-t align-middle
                    hover:bg-muted/40
                  "
                >
                  <td className="p-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{r.name}</span>
                      {r.resource && (
                        <span
                          className="
                            inline-flex w-fit items-center gap-1 rounded-full
                            border border-blue-200 bg-blue-50 px-2 py-0.5
                            text-xs text-blue-900
                          "
                          title={[
                            r.resource.name,
                            r.moduleGroup?.name,
                            r.module?.name,
                          ].filter(Boolean).join(" → ")}
                        >
                          <span>↗</span>
                          <span>
                            {[
                              r.resource.name,
                              r.moduleGroup?.name,
                              r.module?.name,
                            ].filter(Boolean).join(" → ")}
                          </span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <LevelBadge level={r.easeOfStarting} />
                  </td>
                  <td className="p-2">
                    <LevelBadge level={r.timeNeeded} />
                  </td>
                  <td className="p-2">
                    <LevelBadge level={r.interactivity} />
                  </td>
                  <td className="p-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={r.usedYet}
                        disabled={mutation.isPending || isAnyEditing}
                        onChange={e => handleToggleUsed(r.id, e.target.checked)}
                        className="size-4"
                        aria-label={`Mark ${r.name} as used`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {r.usedYet ? "Used" : "Not yet"}
                      </span>
                    </label>
                  </td>
                  <td className="p-2">
                    {r.tags.length > 0
                      ? (
                        <div className="flex flex-wrap gap-1">
                          {r.tags.map(tag => (
                            <TagChip
                              key={tag.id}
                              tag={tag.name}
                            />
                          ))}
                        </div>
                      )
                      : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                  </td>
                  <td className="max-w-xs p-2">
                    {r.url
                      ? (locationIsUrl
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
                        ))
                      : (
                        <span className="text-muted-foreground/60">—</span>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
