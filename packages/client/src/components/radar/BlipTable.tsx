import type { BlipEditDraft } from "@/components/radar/BlipEditRow";
import type {
  BulkPatch,
  SortKey,
} from "@/components/radar/blipTableFilters";
import type { SortDirection } from "@/components/ui/manualSort";
import type {
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";
import type {
  ColumnDef,
  RowSelectionState,
} from "@tanstack/react-table";

import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import {
  ALL,
  countByField,
  filterAndSortBlips,
  NO_CHANGE,
} from "@/components/radar/blipTableFilters";
import {
  BlipBulkBar,
  BlipDisplayRow,
  BlipEditRow,
} from "@/components/radar/blipTableRows";
import { BlipTableToolbar } from "@/components/radar/BlipTableToolbar";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { makeManualSortHandler, toSortingState } from "@/components/ui/manualSort";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useIndexById } from "@/hooks/useIndexBy";

interface BlipTableProps {
  blips: RadarBlip[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  topics: TopicForTopicsPage[];
  onSave: (
    blip: RadarBlip,
    patch: {
      quadrantId: string | null;
      ringId: string | null;
      description: string | null;
      isIgnored: boolean;
    },
  ) => Promise<void>;
  onRemove: (blip: RadarBlip) => Promise<void>;
  onBulkSave: (ids: string[], patch: BulkPatch) => Promise<void>;
}

export function BlipTable({
  blips,
  quadrants,
  rings,
  topics,
  onSave,
  onRemove,
  onBulkSave,
}: BlipTableProps) {
  const [search, setSearch] = useState("");
  const [filterQuadrant, setFilterQuadrant] = useState<string>(ALL);
  const [filterRing, setFilterRing] = useState<string>(ALL);
  const [sortKey, setSortKey] = useState<SortKey>("slice");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<BlipEditDraft | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showItemsColumn, setShowItemsColumn] = useState(false);
  const [bulkQuadrantId, setBulkQuadrantId] = useState<string>(NO_CHANGE);
  const [bulkRingId, setBulkRingId] = useState<string>(NO_CHANGE);
  const [bulkPending, setBulkPending] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const quadrantById = useIndexById(quadrants);
  const ringById = useIndexById(rings);
  const topicById = useIndexById(topics);

  const sliceCounts = useMemo(() => countByField(blips, "quadrantId"), [blips]);

  const ringCounts = useMemo(() => countByField(blips, "ringId"), [blips]);

  const topicItemCount = useCallback(
    (topicId: string): number => {
      const t = topicById.get(topicId);
      if (!t) return 0;
      return (t.resourceCount ?? 0) + (t.taskCount ?? 0) + (t.dailyCount ?? 0);
    },
    [topicById],
  );

  const filteredBlips = useMemo(
    () =>
      filterAndSortBlips(
        blips,
        {
          search,
          filterQuadrant,
          filterRing,
          sortKey,
          sortDir,
        },
        {
          quadrantById,
          ringById,
          topicItemCount,
        },
      ),
    [
      blips,
      search,
      filterQuadrant,
      filterRing,
      sortKey,
      sortDir,
      quadrantById,
      ringById,
      topicItemCount,
    ],
  );

  // Drop selections that scroll out of the filtered view (mirrors the old
  // useRowSelection prune so bulk ops never touch hidden blips).
  useEffect(() => {
    const visible = new Set(filteredBlips.map(b => b.id));
    setRowSelection((prev) => {
      let changed = false;
      const next: RowSelectionState = {};
      for (const id of Object.keys(prev)) {
        if (!prev[id]) continue;
        if (visible.has(id)) next[id] = true;
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [filteredBlips]);

  const selectedIds = useMemo(
    () => new Set(Object.keys(rowSelection).filter(id => rowSelection[id])),
    [rowSelection],
  );

  const sorting = toSortingState(sortKey, sortDir);
  const handleSortingChange = makeManualSortHandler(sorting, (id, dir) => {
    setSortKey(id as SortKey);
    setSortDir(dir);
  });

  function handleClearSelection() {
    setRowSelection({});
    setBulkQuadrantId(NO_CHANGE);
    setBulkRingId(NO_CHANGE);
  }

  function startEdit(blip: RadarBlip) {
    setEditingId(blip.id);
    setEditDraft({
      quadrantId: blip.quadrantId ?? quadrants[0]?.id ?? "",
      ringId: blip.ringId ?? rings[0]?.id ?? "",
      description: blip.description ?? "",
      isIgnored: blip.isIgnored ?? false,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function commitEdit(blip: RadarBlip) {
    if (!editDraft) {
      return;
    }
    // Ignored blips carry no slice/ring; everything else needs both.
    if (!editDraft.isIgnored && (!editDraft.quadrantId || !editDraft.ringId)) {
      toast.error("Pick a slice and ring.");
      return;
    }
    setPendingId(blip.id);
    try {
      await onSave(blip, {
        quadrantId: editDraft.isIgnored ? null : editDraft.quadrantId,
        ringId: editDraft.isIgnored ? null : editDraft.ringId,
        description: editDraft.description.trim() || null,
        isIgnored: editDraft.isIgnored,
      });
      setEditingId(null);
      setEditDraft(null);
    }
    finally {
      setPendingId(null);
    }
  }

  // Quick toggle from the row menu: flip a blip in/out of the ignored category.
  // Moving back to the radar leaves it unassigned for the user to place.
  async function toggleIgnore(blip: RadarBlip) {
    setPendingId(blip.id);
    try {
      await onSave(blip, {
        quadrantId: blip.isIgnored ? blip.quadrantId : null,
        ringId: blip.isIgnored ? blip.ringId : null,
        description: blip.description ?? null,
        isIgnored: !blip.isIgnored,
      });
    }
    finally {
      setPendingId(null);
    }
  }

  async function handleRemove(blip: RadarBlip) {
    setPendingId(blip.id);
    try {
      await onRemove(blip);
      if (editingId === blip.id) {
        setEditingId(null);
        setEditDraft(null);
      }
      setRowSelection((prev) => {
        if (!prev[blip.id]) return prev;
        const next: RowSelectionState = {};
        for (const id of Object.keys(prev)) {
          if (id !== blip.id && prev[id]) next[id] = true;
        }
        return next;
      });
    }
    finally {
      setPendingId(null);
    }
  }

  async function applyBulk() {
    if (selectedIds.size === 0) return;
    if (bulkQuadrantId === NO_CHANGE && bulkRingId === NO_CHANGE) {
      toast.error("Pick a slice or ring to apply.");
      return;
    }
    const patch: BulkPatch = {};
    if (bulkQuadrantId !== NO_CHANGE) patch.quadrantId = bulkQuadrantId;
    if (bulkRingId !== NO_CHANGE) patch.ringId = bulkRingId;
    setBulkPending(true);
    try {
      await onBulkSave(Array.from(selectedIds), patch);
      setBulkQuadrantId(NO_CHANGE);
      setBulkRingId(NO_CHANGE);
      setRowSelection({});
    }
    finally {
      setBulkPending(false);
    }
  }

  const colCount = (showItemsColumn ? 6 : 5) + 1;

  const columns = useMemo<ColumnDef<RadarBlip>[]>(() => {
    const cols: ColumnDef<RadarBlip>[] = [
      {
        id: "select",
        enableSorting: false,
        meta: {
          headClassName: "w-1",
        },
        header: ({
          table,
        }) => (
          <SelectAllCheckbox
            aria-label="Select all visible"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onCheckedChange={value => table.toggleAllRowsSelected(value)}
            disabled={table.getRowModel().rows.length === 0}
          />
        ),
      },
      {
        id: "topic",
        sortDescFirst: false,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Topic"
          />
        ),
      },
      {
        id: "slice",
        sortDescFirst: false,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Slice"
          />
        ),
      },
      {
        id: "ring",
        sortDescFirst: false,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Ring"
          />
        ),
      },
      {
        id: "radarNote",
        enableSorting: false,
        header: "Radar Note",
      },
    ];

    if (showItemsColumn) {
      cols.push({
        id: "items",
        sortDescFirst: false,
        header: ({
          column,
        }) => (
          <DataTableColumnHeader
            column={column}
            label="Topic Items"
          />
        ),
      });
    }

    cols.push({
      id: "actions",
      enableSorting: false,
      meta: {
        align: "right",
        headClassName: "w-1",
      },
      header: "Actions",
    });

    return cols;
  }, [showItemsColumn]);

  return (
    <div className="flex flex-col gap-3">
      <BlipTableToolbar
        search={search}
        onSearchChange={setSearch}
        filterQuadrant={filterQuadrant}
        onFilterQuadrantChange={setFilterQuadrant}
        filterRing={filterRing}
        onFilterRingChange={setFilterRing}
        showItemsColumn={showItemsColumn}
        onShowItemsColumnChange={setShowItemsColumn}
        quadrants={quadrants}
        rings={rings}
        blipCount={blips.length}
        sliceCounts={sliceCounts}
        ringCounts={ringCounts}
      />

      {selectedIds.size > 0 && (
        <BlipBulkBar
          selectedCount={selectedIds.size}
          quadrants={quadrants}
          rings={rings}
          bulkQuadrantId={bulkQuadrantId}
          bulkRingId={bulkRingId}
          onBulkQuadrantChange={setBulkQuadrantId}
          onBulkRingChange={setBulkRingId}
          bulkPending={bulkPending}
          onApply={applyBulk}
          onClear={handleClearSelection}
        />
      )}

      <DataTable
        columns={columns}
        data={filteredBlips}
        getRowId={blip => blip.id}
        manualSorting
        sorting={sorting}
        onSortingChange={handleSortingChange}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        containerClassName="rounded-sm border"
        renderEmpty={() => (
          <TableRow>
            <TableCell
              colSpan={colCount}
              className="text-center text-muted-foreground"
            >
              {blips.length === 0
                ? "No blips yet."
                : "No blips match the current filters."}
            </TableCell>
          </TableRow>
        )}
        renderRow={(row) => {
          const blip = row.original;
          const isEditing = editingId === blip.id && editDraft !== null;
          const isPending = pendingId === blip.id;
          const topic = topicById.get(blip.topicId);
          return isEditing
            ? (
              <BlipEditRow
                blip={blip}
                topicDescription={topic?.description ?? null}
                draft={editDraft}
                onDraftChange={setEditDraft}
                quadrants={quadrants}
                rings={rings}
                isPending={isPending}
                onCommit={() => commitEdit(blip)}
                onCancel={cancelEdit}
                colCount={colCount}
              />
            )
            : (
              <BlipDisplayRow
                blip={blip}
                topic={topic}
                quadrantById={quadrantById}
                ringById={ringById}
                isSelected={row.getIsSelected()}
                isPending={isPending}
                editingLocked={editingId !== null}
                showItemsColumn={showItemsColumn}
                onToggleSelected={() => row.toggleSelected()}
                onStartEdit={() => startEdit(blip)}
                onToggleIgnore={() => toggleIgnore(blip)}
                onRemove={() => handleRemove(blip)}
              />
            );
        }}
      />
    </div>
  );
}
