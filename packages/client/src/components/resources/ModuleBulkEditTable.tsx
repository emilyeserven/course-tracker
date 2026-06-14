import type { ModuleGroupOption } from "./ModuleBulkEditRow";
import type { ModuleDraft } from "./moduleDrafts";
import type { ModuleBulkEditDrafts } from "@/hooks/useModuleBulkEditDrafts";
import type { Module, ModuleGroup, ModuleStatus, TagGroup } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { useMemo, useState } from "react";

import { Loader2, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { ModuleBulkEditRow } from "./ModuleBulkEditRow";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { TableCell, TableRow } from "@/components/ui/table";

export interface BulkSaveRow {
  draft: ModuleDraft;
  groupId: string | null;
  status: ModuleStatus;
}

interface ModuleBulkEditTableProps {
  /** Flat, display-ordered module list — also what `editor` was seeded from. */
  modules: Module[];
  groups: ModuleGroup[];
  tagGroups: TagGroup[];
  isBook: boolean;
  editor: ModuleBulkEditDrafts;
  isSaving: boolean;
  onSaveAll: (rows: BulkSaveRow[]) => void;
}

/**
 * Spreadsheet-style editor for every module of a resource. Each row's staged
 * edits live in `editor` (`useModuleBulkEditDrafts`); "Save all" persists only
 * the changed rows in one batch via `onSaveAll`. The bulkier effort-level / tag
 * controls live in a per-row expandable sub-row to keep the grid scannable.
 */
export function ModuleBulkEditTable({
  modules,
  groups,
  tagGroups,
  isBook,
  editor,
  isSaving,
  onSaveAll,
}: ModuleBulkEditTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const columns = useMemo<ColumnDef<Module>[]>(() => {
    const cols: ColumnDef<Module>[] = [
      {
        id: "expand",
        header: "",
        meta: {
          headClassName: "w-8",
        },
      },
      {
        id: "group",
        header: "Group",
      },
      {
        id: "name",
        header: "Name",
      },
      {
        id: "status",
        header: "Status",
      },
      {
        id: "length",
        header: "Length",
      },
    ];
    if (isBook) {
      cols.push({
        id: "pages",
        header: "Pages",
      });
    }
    cols.push({
      id: "url",
      header: isBook ? "URL" : "Location",
    });
    return cols;
  }, [isBook]);

  const colCount = columns.length;

  const groupOptions = useMemo<ModuleGroupOption[]>(
    () => [
      {
        value: "",
        label: "Ungrouped",
      },
      ...groups.map(g => ({
        value: g.id,
        label: g.name,
      })),
    ],
    [groups],
  );

  const {
    dirtyCount,
  } = editor;

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSaveAll() {
    const rows = editor.changedRows();
    if (rows.length === 0) return;
    if (rows.some(r => r.draft.name.trim() === "")) {
      toast.error("Every module needs a name.");
      return;
    }
    onSaveAll(
      rows.map(r => ({
        draft: r.draft,
        groupId: r.moduleGroupId,
        status: r.status,
      })),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {dirtyCount > 0
            ? `${dirtyCount} unsaved ${dirtyCount === 1 ? "change" : "changes"}`
            : "No unsaved changes"}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={editor.reset}
            disabled={dirtyCount === 0 || isSaving}
          >
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveAll}
            disabled={dirtyCount === 0 || isSaving}
          >
            {isSaving
              ? <Loader2 className="size-4 animate-spin" />
              : <SaveIcon className="size-4" />}
            Save all
            {dirtyCount > 0 ? ` (${dirtyCount})` : ""}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={modules}
        getRowId={m => m.id}
        containerClassName="overflow-x-auto rounded-sm border"
        renderRow={(row) => {
          // During the one render between a module-list change and the hook's
          // re-seed effect, a row's draft can be momentarily absent — skip it
          // rather than crash; the next frame fills it in.
          const rowDraft = editor.drafts[row.original.id];
          if (!rowDraft) return null;
          return (
            <ModuleBulkEditRow
              rowDraft={rowDraft}
              groupOptions={groupOptions}
              tagGroups={tagGroups}
              showPages={isBook}
              colCount={colCount}
              isDirty={editor.isRowDirty(row.original.id)}
              expanded={expandedIds.has(row.original.id)}
              disabled={isSaving}
              onToggleExpand={() => toggleExpand(row.original.id)}
              onPatchDraft={patch => editor.patchDraft(row.original.id, patch)}
              onPatchRow={patch => editor.patchRow(row.original.id, patch)}
            />
          );
        }}
        renderEmpty={() => (
          <TableRow>
            <TableCell
              colSpan={colCount}
              className="text-center text-sm text-muted-foreground"
            >
              No modules to edit yet.
            </TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
