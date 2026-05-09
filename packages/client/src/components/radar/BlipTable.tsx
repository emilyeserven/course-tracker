import type {
  RadarBlip,
  TopicForTopicsPage,
} from "@emstack/types/src";

import { useMemo, useState } from "react";

import { Link } from "@tanstack/react-router";
import {
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  ListChecksIcon,
  Loader2,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SunIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Pill } from "@/components/radar/Pill";
import {
  pillClassByIndex,
  RING_PILL_CLASSES,
  SLICE_PILL_CLASSES,
} from "@/components/radar/radarColors";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface QuadrantInfo {
  id: string;
  name: string;
  position: number;
}

interface RingInfo {
  id: string;
  name: string;
  position: number;
  isAdopted?: boolean;
}

type SortKey = "topic" | "slice" | "ring" | "items";
type SortDir = "asc" | "desc";

interface BlipTableProps {
  blips: RadarBlip[];
  quadrants: QuadrantInfo[];
  rings: RingInfo[];
  topics: TopicForTopicsPage[];
  onSave: (
    blip: RadarBlip,
    patch: { quadrantId: string;
      ringId: string;
      description: string | null; },
  ) => Promise<void>;
  onRemove: (blip: RadarBlip) => Promise<void>;
}

const ALL = "__all__";
const UNASSIGNED = "__unassigned__";

interface EditDraft {
  quadrantId: string;
  ringId: string;
  description: string;
}

export function BlipTable({
  blips,
  quadrants,
  rings,
  topics,
  onSave,
  onRemove,
}: BlipTableProps) {
  const [search, setSearch] = useState("");
  const [filterQuadrant, setFilterQuadrant] = useState<string>(ALL);
  const [filterRing, setFilterRing] = useState<string>(ALL);
  const [sortKey, setSortKey] = useState<SortKey>("slice");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showItemsColumn, setShowItemsColumn] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir(prev => prev === "asc" ? "desc" : "asc");
  }

  const quadrantById = useMemo(() => {
    const map = new Map<string, QuadrantInfo>();
    quadrants.forEach(q => map.set(q.id, q));
    return map;
  }, [quadrants]);

  const ringById = useMemo(() => {
    const map = new Map<string, RingInfo>();
    rings.forEach(r => map.set(r.id, r));
    return map;
  }, [rings]);

  const topicById = useMemo(() => {
    const map = new Map<string, TopicForTopicsPage>();
    topics.forEach(t => map.set(t.id, t));
    return map;
  }, [topics]);

  const sliceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    let unassigned = 0;
    blips.forEach((b) => {
      if (b.quadrantId) {
        counts.set(b.quadrantId, (counts.get(b.quadrantId) ?? 0) + 1);
      }
      else {
        unassigned += 1;
      }
    });
    return {
      counts,
      unassigned,
    };
  }, [blips]);

  const ringCounts = useMemo(() => {
    const counts = new Map<string, number>();
    let unassigned = 0;
    blips.forEach((b) => {
      if (b.ringId) {
        counts.set(b.ringId, (counts.get(b.ringId) ?? 0) + 1);
      }
      else {
        unassigned += 1;
      }
    });
    return {
      counts,
      unassigned,
    };
  }, [blips]);

  function topicItemCount(topicId: string): number {
    const t = topicById.get(topicId);
    if (!t) return 0;
    return (t.courseCount ?? 0) + (t.taskCount ?? 0) + (t.dailyCount ?? 0);
  }

  const filteredBlips = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = blips.filter((b) => {
      if (filterQuadrant === UNASSIGNED) {
        if (b.quadrantId !== null) return false;
      }
      else if (filterQuadrant !== ALL && b.quadrantId !== filterQuadrant) {
        return false;
      }
      if (filterRing === UNASSIGNED) {
        if (b.ringId !== null) return false;
      }
      else if (filterRing !== ALL && b.ringId !== filterRing) {
        return false;
      }
      if (query) {
        const topicName = b.topicName?.toLowerCase() ?? "";
        const note = b.description?.toLowerCase() ?? "";
        if (!topicName.includes(query) && !note.includes(query)) {
          return false;
        }
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = filtered.slice().sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sortKey === "topic") {
        av = (a.topicName ?? "").toLowerCase();
        bv = (b.topicName ?? "").toLowerCase();
      }
      else if (sortKey === "slice") {
        av = quadrantById.get(a.quadrantId ?? "")?.position ?? Number.MAX_SAFE_INTEGER;
        bv = quadrantById.get(b.quadrantId ?? "")?.position ?? Number.MAX_SAFE_INTEGER;
      }
      else if (sortKey === "items") {
        av = topicItemCount(a.topicId);
        bv = topicItemCount(b.topicId);
      }
      else {
        av = ringById.get(a.ringId ?? "")?.position ?? Number.MAX_SAFE_INTEGER;
        bv = ringById.get(b.ringId ?? "")?.position ?? Number.MAX_SAFE_INTEGER;
      }
      if (av < bv) {
        return -1 * dir;
      }
      if (av > bv) {
        return 1 * dir;
      }
      return (a.topicName ?? "").localeCompare(b.topicName ?? "");
    });
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    blips,
    search,
    filterQuadrant,
    filterRing,
    sortKey,
    sortDir,
    quadrantById,
    ringById,
    topicById,
  ]);

  function sortIcon(key: SortKey) {
    if (sortKey !== key) {
      return <ChevronsUpDownIcon className="size-3 opacity-50" />;
    }
    return sortDir === "asc"
      ? <ChevronUpIcon className="size-3" />
      : <ChevronDownIcon className="size-3" />;
  }

  function startEdit(blip: RadarBlip) {
    setEditingId(blip.id);
    setEditDraft({
      quadrantId: blip.quadrantId ?? quadrants[0]?.id ?? "",
      ringId: blip.ringId ?? rings[0]?.id ?? "",
      description: blip.description ?? "",
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
    if (!editDraft.quadrantId || !editDraft.ringId) {
      toast.error("Pick a slice and ring.");
      return;
    }
    setPendingId(blip.id);
    try {
      await onSave(blip, {
        quadrantId: editDraft.quadrantId,
        ringId: editDraft.ringId,
        description: editDraft.description.trim() || null,
      });
      setEditingId(null);
      setEditDraft(null);
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
    }
    finally {
      setPendingId(null);
    }
  }

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
            <SelectItem value={ALL}>
              All Slices (
              {blips.length}
              )
            </SelectItem>
            <SelectItem value={UNASSIGNED}>
              Unassigned (
              {sliceCounts.unassigned}
              )
            </SelectItem>
            {quadrants.map(q => (
              <SelectItem
                key={q.id}
                value={q.id}
              >
                {q.name}
                {" ("}
                {sliceCounts.counts.get(q.id) ?? 0}
                )
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
            <SelectItem value={ALL}>
              All Rings (
              {blips.length}
              )
            </SelectItem>
            <SelectItem value={UNASSIGNED}>
              Unassigned (
              {ringCounts.unassigned}
              )
            </SelectItem>
            {rings.map(r => (
              <SelectItem
                key={r.id}
                value={r.id}
              >
                {r.name}
                {" ("}
                {ringCounts.counts.get(r.id) ?? 0}
                )
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label
          className="flex flex-row items-center gap-2 text-sm"
        >
          <input
            type="checkbox"
            checked={showItemsColumn}
            onChange={e => setShowItemsColumn(e.target.checked)}
          />
          Topic Items
        </label>
      </div>

      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
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
                  colSpan={showItemsColumn ? 6 : 5}
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
              const topic = topicById.get(blip.topicId);
              const topicDescription = topic?.description ?? null;
              return isEditing
                ? (
                  <TableRow key={blip.id}>
                    <TableCell colSpan={showItemsColumn ? 6 : 5}>
                      <div
                        className={`
                          grid grid-cols-1 gap-4
                          md:grid-cols-2
                        `}
                      >
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-xs text-muted-foreground uppercase"
                          >
                            Topic
                          </span>
                          <h3 className="text-lg font-semibold">
                            {blip.topicName}
                          </h3>
                          {topicDescription
                            ? (
                              <p className="text-sm text-muted-foreground">
                                {topicDescription}
                              </p>
                            )
                            : (
                              <p
                                className={`
                                  text-sm text-muted-foreground italic
                                `}
                              >
                                (no topic description)
                              </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase">
                              Slice
                            </label>
                            <Select
                              value={editDraft.quadrantId}
                              onValueChange={value =>
                                setEditDraft(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      quadrantId: value,
                                    }
                                    : prev)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose slice" />
                              </SelectTrigger>
                              <SelectContent>
                                {quadrants.map(q => (
                                  <SelectItem
                                    key={q.id}
                                    value={q.id}
                                  >
                                    {q.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase">Ring</label>
                            <Select
                              value={editDraft.ringId}
                              onValueChange={value =>
                                setEditDraft(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      ringId: value,
                                    }
                                    : prev)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose ring" />
                              </SelectTrigger>
                              <SelectContent>
                                {rings.map(r => (
                                  <SelectItem
                                    key={r.id}
                                    value={r.id}
                                  >
                                    {r.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase">
                              Radar Note
                            </label>
                            <Textarea
                              value={editDraft.description}
                              onChange={e =>
                                setEditDraft(prev =>
                                  prev
                                    ? {
                                      ...prev,
                                      description: e.target.value,
                                    }
                                    : prev)}
                            />
                          </div>
                          <div className="flex flex-row gap-2">
                            <Button
                              type="button"
                              onClick={() => commitEdit(blip)}
                              disabled={isPending}
                            >
                              {isPending && (
                                <Loader2 className="animate-spin" />
                              )}
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={cancelEdit}
                              disabled={isPending}
                            >
                              <XIcon />
                              {" "}
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
                : (
                  <TableRow key={blip.id}>
                    <TableCell className="font-medium">
                      {blip.topicName}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const q = blip.quadrantId
                          ? quadrantById.get(blip.quadrantId)
                          : undefined;
                        if (!q) {
                          return (
                            <span
                              className="text-xs text-muted-foreground italic"
                            >
                              unassigned
                            </span>
                          );
                        }
                        return (
                          <Pill
                            className={pillClassByIndex(
                              SLICE_PILL_CLASSES,
                              q.position,
                            )}
                          >
                            {q.name}
                          </Pill>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const r = blip.ringId
                          ? ringById.get(blip.ringId)
                          : undefined;
                        if (!r) {
                          return (
                            <span
                              className="text-xs text-muted-foreground italic"
                            >
                              unassigned
                            </span>
                          );
                        }
                        return (
                          <Pill
                            className={pillClassByIndex(
                              RING_PILL_CLASSES,
                              r.position,
                            )}
                          >
                            {r.name}
                          </Pill>
                        );
                      })()}
                    </TableCell>
                    <TableCell
                      className={`
                        max-w-xs text-sm whitespace-pre-wrap
                        text-muted-foreground
                      `}
                    >
                      {blip.description?.trim() || "—"}
                    </TableCell>
                    {showItemsColumn && (
                      <TableCell className="text-sm text-muted-foreground">
                        {topic
                          ? (
                            <div className="flex flex-row flex-wrap gap-2">
                              <span title="Courses">
                                C:
                                {" "}
                                {topic.courseCount ?? 0}
                              </span>
                              <span title="Tasks">
                                T:
                                {" "}
                                {topic.taskCount ?? 0}
                              </span>
                              <span title="Dailies">
                                D:
                                {" "}
                                {topic.dailyCount ?? 0}
                              </span>
                            </div>
                          )
                          : "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending || editingId !== null}
                            aria-label="More actions"
                          >
                            {isPending
                              ? <Loader2 className="animate-spin" />
                              : <MoreHorizontalIcon />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(blip)}>
                            <PencilIcon />
                            {" "}
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemove(blip)}>
                            <TrashIcon />
                            {" "}
                            Remove
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs">
                            Quick Create
                          </DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/dailies/$id/edit"
                              params={{
                                id: "new",
                              }}
                              search={{
                                topicId: blip.topicId,
                              }}
                            >
                              <SunIcon />
                              {" "}
                              Daily Item
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/tasks/$id/edit"
                              params={{
                                id: "new",
                              }}
                              search={{
                                topicId: blip.topicId,
                              }}
                            >
                              <ListChecksIcon />
                              {" "}
                              Task
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/courses/$id/edit"
                              params={{
                                id: "new",
                              }}
                              search={{
                                topicId: blip.topicId,
                              }}
                            >
                              <BookOpenIcon />
                              {" "}
                              Course
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/topics/$id"
                              params={{
                                id: blip.topicId,
                              }}
                            >
                              <PlusIcon />
                              {" "}
                              View Topic
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
