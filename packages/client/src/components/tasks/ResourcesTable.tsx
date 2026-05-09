import type { Resource, ResourceLevel, Task } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { TagsFilter } from "./TagsFilter";
import { TagsInput } from "./TagsInput";

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
import { isHttpUrl, upsertTask } from "@/utils";
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
  level: Resource["easeOfStarting"];
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
  resource: ResourceLevel | null | undefined,
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
  value: ResourceLevel | null | undefined;
  onValueChange: (next: ResourceLevel | null) => void;
  ariaLabel: string;
}) {
  return (
    <Select
      value={value ?? NONE_VALUE}
      onValueChange={(v) => {
        onValueChange(v === NONE_VALUE ? null : (v as ResourceLevel));
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

function EditingRow({
  resource,
  tagSuggestions,
  isNew = false,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: {
  resource: Resource;
  tagSuggestions: string[];
  isNew?: boolean;
  isSaving?: boolean;
  onSave: (next: Resource) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<Resource>(resource);

  function update(patch: Partial<Resource>) {
    setDraft(prev => ({
      ...prev,
      ...patch,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(draft);
  }

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
            <TagsInput
              value={draft.tags ?? []}
              onChange={tags => update({
                tags,
              })}
              suggestions={tagSuggestions}
              placeholder={tagSuggestions.length > 0
                ? "Pick or type a tag..."
                : "Type a tag..."}
              groupByPrefix
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

  const [search, setSearch] = useState("");
  const [usedFilter, setUsedFilter] = useState<string>(ANY_VALUE);
  const [easeFilter, setEaseFilter] = useState<string>(ANY_VALUE);
  const [timeFilter, setTimeFilter] = useState<string>(ANY_VALUE);
  const [interactivityFilter, setInteractivityFilter] = useState<string>(ANY_VALUE);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNewResource, setDraftNewResource] = useState<Resource | null>(
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
        const resourceTags = r.tags ?? [];
        if (!tagFilter.every(t => resourceTags.includes(t))) return false;
      }
      return true;
    });
  }, [resources, search, usedFilter, easeFilter, timeFilter, interactivityFilter, tagFilter]);

  const mutation = useMutation({
    mutationFn: (next: Resource[]) =>
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
          tags: r.tags ?? [],
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

  function handleSaveEdit(updated: Resource) {
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

  function handleSaveNew(created: Resource) {
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
      tags: [],
    });
  }

  function startEdit(resourceId: string) {
    setDraftNewResource(null);
    setEditingId(resourceId);
  }

  const tagSuggestions = task.taskType?.tags ?? [];
  const tagFilterOptions = useMemo(() => {
    const set = new Set<string>(tagSuggestions);
    for (const r of resources) {
      for (const t of r.tags ?? []) set.add(t);
    }
    return Array.from(set);
  }, [resources, tagSuggestions]);
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
            <TagsFilter
              value={tagFilter}
              onChange={setTagFilter}
              options={tagFilterOptions}
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
                tagSuggestions={tagSuggestions}
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
                    tagSuggestions={tagSuggestions}
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
                    <span className="font-medium">{r.name}</span>
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
                              key={tag}
                              tag={tag}
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
