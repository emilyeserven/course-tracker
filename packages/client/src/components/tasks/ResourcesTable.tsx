import type { Task, TaskResource } from "@emstack/types";

import { useMemo, useState } from "react";

import { PlusIcon, SearchIcon } from "lucide-react";

import { inheritedLevel, linkedResourceLabel } from "./resourceMeta";
import { COLUMN_COUNT, EditingRow } from "./TaskResourceEditingRow";
import { TaskResourceRow } from "./TaskResourceRow";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskResources } from "@/hooks/useTaskResources";
import { uuidv4 } from "@/utils/uuid";

interface ResourcesTableProps {
  task: Task;
}

const ANY_VALUE = "__any";

export function ResourcesTable({
  task,
}: ResourcesTableProps) {
  const [search, setSearch] = useState("");
  const [usedFilter, setUsedFilter] = useState<string>(ANY_VALUE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNewResource, setDraftNewResource] = useState<TaskResource | null>(
    null,
  );
  const [loggingFor, setLoggingFor] = useState<string | null>(null);

  const {
    resources,
    allModuleGroups,
    allModules,
    resourceOptions,
    mutation,
    handleToggleUsed,
    handleSaveEdit,
    handleSaveNew,
    handleDelete,
  } = useTaskResources({
    task,
    onEditSaved: () => setEditingId(null),
    onNewSaved: () => setDraftNewResource(null),
    onDeleted: () => setEditingId(null),
  });

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
              const modulesList = allModules ?? [];
              const groupsList = allModuleGroups ?? [];
              return (
                <TaskResourceRow
                  key={r.id}
                  resource={r}
                  ease={inheritedLevel(
                    r,
                    "easeOfStarting",
                    modulesList,
                    groupsList,
                  )}
                  time={inheritedLevel(
                    r,
                    "timeNeeded",
                    modulesList,
                    groupsList,
                  )}
                  interactivity={inheritedLevel(
                    r,
                    "interactivity",
                    modulesList,
                    groupsList,
                  )}
                  linkedLabel={linkedResourceLabel(r)}
                  isAnyEditing={isAnyEditing}
                  isMutationPending={mutation.isPending}
                  isLogging={loggingFor === r.id}
                  onToggleUsed={handleToggleUsed}
                  onStartEdit={() => startEdit(r.id)}
                  onLogInteraction={() => setLoggingFor(r.id)}
                  onCloseLog={() => setLoggingFor(null)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
