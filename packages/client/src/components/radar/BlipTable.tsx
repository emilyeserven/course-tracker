import type { BlipEditDraft } from "@/components/radar/BlipEditRow";
import type {
  BulkPatch,
  SortDir,
  SortKey,
} from "@/components/radar/blipTableFilters";
import type {
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { useCallback, useMemo, useState } from "react";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { BlipBulkBar } from "@/components/radar/BlipBulkBar";
import { BlipDisplayRow } from "@/components/radar/BlipDisplayRow";
import { BlipEditRow } from "@/components/radar/BlipEditRow";
import {
  ALL,
  countByField,
  filterAndSortBlips,
  NO_CHANGE,
  UNASSIGNED,
} from "@/components/radar/blipTableFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRowSelection } from "@/hooks/useRowSelection";

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
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<BlipEditDraft | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showItemsColumn, setShowItemsColumn] = useState(false);
  const [bulkQuadrantId, setBulkQuadrantId] = useState<string>(NO_CHANGE);
  const [bulkRingId, setBulkRingId] = useState<string>(NO_CHANGE);
  const [bulkPending, setBulkPending] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    // Incidental similarity to BlipLlmAssist's lookup maps; different domain types.
    // fallow-ignore-next-line code-duplication
    setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
  }

  const quadrantById = useMemo(() => {
    const map = new Map<string, RadarQuadrant>();
    quadrants.forEach(q => map.set(q.id, q));
    return map;
  }, [quadrants]);

  const ringById = useMemo(() => {
    const map = new Map<string, RadarRing>();
    rings.forEach(r => map.set(r.id, r));
    return map;
  }, [rings]);

  const topicById = useMemo(() => {
    const map = new Map<string, TopicForTopicsPage>();
    topics.forEach(t => map.set(t.id, t));
    return map;
  }, [topics]);

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

  const visibleIds = useMemo(
    () => filteredBlips.map(b => b.id),
    [filteredBlips],
  );

  const {
    selectedIds,
    setSelectedIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleSelected,
    toggleSelectAllVisible,
    clearSelection,
  } = useRowSelection(visibleIds);

  function handleClearSelection() {
    clearSelection();
    setBulkQuadrantId(NO_CHANGE);
    setBulkRingId(NO_CHANGE);
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) {
      return <ChevronsUpDownIcon className="size-3 opacity-50" />;
    }
    return sortDir === "asc"
      ? (
        <ChevronUpIcon className="size-3" />
      )
      : (
        <ChevronDownIcon className="size-3" />
      );
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
      setSelectedIds((prev) => {
        if (!prev.has(blip.id)) return prev;
        const next = new Set(prev);
        next.delete(blip.id);
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
      clearSelection();
    }
    finally {
      setBulkPending(false);
    }
  }

  const colCount = (showItemsColumn ? 6 : 5) + 1;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`
          grid grid-cols-1 gap-2
          sm:grid-cols-[1fr_auto_auto_auto]
        `}
      >
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search topic or note"
        />
        <Select
          value={filterQuadrant}
          onValueChange={setFilterQuadrant}
        >
          <SelectTrigger className="min-w-40">
            <SelectValue placeholder="Slice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Slices ({blips.length})</SelectItem>
            <SelectItem value={UNASSIGNED}>
              Unassigned ({sliceCounts.unassigned})
            </SelectItem>
            {quadrants.map(q => (
              <SelectItem
                key={q.id}
                value={q.id}
              >
                {q.name}
                {" ("}
                {sliceCounts.counts.get(q.id) ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterRing}
          onValueChange={setFilterRing}
        >
          <SelectTrigger className="min-w-32">
            <SelectValue placeholder="Ring" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Rings ({blips.length})</SelectItem>
            <SelectItem value={UNASSIGNED}>
              Unassigned ({ringCounts.unassigned})
            </SelectItem>
            {rings.map(r => (
              <SelectItem
                key={r.id}
                value={r.id}
              >
                {r.name}
                {" ("}
                {ringCounts.counts.get(r.id) ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex flex-row items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showItemsColumn}
            onChange={e => setShowItemsColumn(e.target.checked)}
          />
          Topic Items
        </label>
      </div>

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

      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1">
                <input
                  type="checkbox"
                  aria-label="Select all visible"
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someVisibleSelected;
                  }}
                  onChange={toggleSelectAllVisible}
                  disabled={filteredBlips.length === 0}
                />
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("topic")}
                  className={`
                    inline-flex items-center gap-1
                    hover:text-foreground
                  `}
                >
                  Topic
                  {sortIcon("topic")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("slice")}
                  className={`
                    inline-flex items-center gap-1
                    hover:text-foreground
                  `}
                >
                  Slice
                  {sortIcon("slice")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => toggleSort("ring")}
                  className={`
                    inline-flex items-center gap-1
                    hover:text-foreground
                  `}
                >
                  Ring
                  {sortIcon("ring")}
                </button>
              </TableHead>
              <TableHead>Radar Note</TableHead>
              {showItemsColumn && (
                <TableHead>
                  <button
                    type="button"
                    onClick={() => toggleSort("items")}
                    className={`
                      inline-flex items-center gap-1
                      hover:text-foreground
                    `}
                  >
                    Topic Items
                    {sortIcon("items")}
                  </button>
                </TableHead>
              )}
              <TableHead className="w-1 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBlips.length === 0 && (
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
            {filteredBlips.map((blip) => {
              const isEditing = editingId === blip.id && editDraft !== null;
              const isPending = pendingId === blip.id;
              const isSelected = selectedIds.has(blip.id);
              const topic = topicById.get(blip.topicId);
              return isEditing
                ? (
                  <BlipEditRow
                    key={blip.id}
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
                    key={blip.id}
                    blip={blip}
                    topic={topic}
                    quadrantById={quadrantById}
                    ringById={ringById}
                    isSelected={isSelected}
                    isPending={isPending}
                    editingLocked={editingId !== null}
                    showItemsColumn={showItemsColumn}
                    onToggleSelected={() => toggleSelected(blip.id)}
                    onStartEdit={() => startEdit(blip)}
                    onToggleIgnore={() => toggleIgnore(blip)}
                    onRemove={() => handleRemove(blip)}
                  />
                );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
