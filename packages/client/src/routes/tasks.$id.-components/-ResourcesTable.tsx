import type { Task, TaskResource } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { useMemo, useState } from "react";

import { PlusIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/input";
import {
  COLUMN_COUNT,
  EditingRow,
  inheritedLevel,
  linkedResourceLabel,
  TaskResourceRow,
} from "@/components/tasks/taskResourceTable";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useTaskResources } from "@/hooks/useTaskResources";
import { uuidv4 } from "@/utils/uuid";

interface ResourcesTableProps {
  task: Task;
}

const ANY_VALUE = "__any";

// Header layout only — rows render via `DataTable`'s `renderRow` (the display
// rows and the full-width inline editor don't map to per-column cells).
const columns: ColumnDef<TaskResource>[] = [
  {
    id: "name",
    enableSorting: false,
    header: "Name",
  },
  {
    id: "ease",
    enableSorting: false,
    header: "Ease of Starting",
    meta: {
      headClassName: "whitespace-nowrap",
    },
  },
  {
    id: "time",
    enableSorting: false,
    header: "Time Needed",
    meta: {
      headClassName: "whitespace-nowrap",
    },
  },
  {
    id: "interactivity",
    enableSorting: false,
    header: "Interactivity",
  },
  {
    id: "used",
    enableSorting: false,
    header: "Used yet?",
    meta: {
      headClassName: "whitespace-nowrap",
    },
  },
  {
    id: "location",
    enableSorting: false,
    header: "Location",
  },
  {
    id: "logAction",
    enableSorting: false,
    header: () => null,
    meta: {
      headClassName: "w-24",
    },
  },
  {
    id: "editAction",
    enableSorting: false,
    header: () => null,
  },
];

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

  // The draft "new" row renders above the existing rows, so feed it into the
  // table as the first row when present.
  const tableData = draftNewResource
    ? [draftNewResource, ...filtered]
    : filtered;

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

      <DataTable
        columns={columns}
        data={tableData}
        getRowId={r => r.id}
        className="border-collapse"
        renderEmpty={() => (
          <TableRow>
            <TableCell
              colSpan={COLUMN_COUNT}
              className="p-4 text-center text-muted-foreground"
            >
              <i>No resources match these filters.</i>
            </TableCell>
          </TableRow>
        )}
        renderRow={(row) => {
          const r = row.original;
          if (draftNewResource && r.id === draftNewResource.id) {
            return (
              <EditingRow
                resource={draftNewResource}
                resourceOptions={resourceOptions}
                allModuleGroups={allModuleGroups ?? []}
                allModules={allModules ?? []}
                isNew
                isSaving={mutation.isPending}
                onSave={handleSaveNew}
                onCancel={() => setDraftNewResource(null)}
              />
            );
          }
          if (r.id === editingId && editingResource) {
            return (
              <EditingRow
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
              resource={r}
              ease={inheritedLevel(
                r,
                "easeOfStarting",
                modulesList,
                groupsList,
              )}
              time={inheritedLevel(r, "timeNeeded", modulesList, groupsList)}
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
        }}
      />
    </div>
  );
}
