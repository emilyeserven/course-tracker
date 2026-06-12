import type { EditDraft, Resolution, ResolvedLlmEntry } from "./blipLlmReview";
import type {
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { CheckIcon, PencilIcon, XIcon } from "lucide-react";

import {
  descriptionChanged,
  quadrantChanged,
  radarNoteChanged,
  ringChanged,
} from "./blipLlmReview";

import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
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

interface ReviewTableProps {
  resolved: ResolvedLlmEntry[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  quadrantById: Map<string, RadarQuadrant>;
  ringById: Map<string, RadarRing>;
  topicById: Map<string, TopicForTopicsPage>;
  updateEntry: (idx: number, patch: Partial<ResolvedLlmEntry>) => void;
  startEdit: (idx: number) => void;
  commitEdit: (idx: number) => void;
  cancelEdit: (idx: number) => void;
  updateDraft: (idx: number, patch: Partial<EditDraft>) => void;
  setRowSelected: (idx: number, selected: boolean) => void;
  setAllSelected: (selected: boolean) => void;
}

export function ReviewTable({
  resolved,
  quadrants,
  rings,
  quadrantById,
  ringById,
  topicById,
  updateEntry,
  startEdit,
  commitEdit,
  cancelEdit,
  updateDraft,
  setRowSelected,
  setAllSelected,
}: ReviewTableProps) {
  const allSelected = resolved.length > 0 && resolved.every(r => r.selected);
  const someSelected = resolved.some(r => r.selected);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">
            <input
              type="checkbox"
              aria-label={allSelected ? "Deselect all" : "Select all"}
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = !allSelected && someSelected;
                }
              }}
              onChange={e => setAllSelected(e.target.checked)}
            />
          </TableHead>
          <TableHead className="min-w-32">Topic</TableHead>
          <TableHead className="min-w-56">Description</TableHead>
          <TableHead className="min-w-32">Slice</TableHead>
          <TableHead className="min-w-32">Ring</TableHead>
          <TableHead className="min-w-56">Radar Note</TableHead>
          <TableHead className="w-24">Edit</TableHead>
          <TableHead className="min-w-44">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resolved.map((r, idx) => (
          <ReviewRow
            key={idx}
            idx={idx}
            r={r}
            quadrants={quadrants}
            rings={rings}
            quadrantById={quadrantById}
            ringById={ringById}
            topicById={topicById}
            updateEntry={updateEntry}
            startEdit={startEdit}
            commitEdit={commitEdit}
            cancelEdit={cancelEdit}
            updateDraft={updateDraft}
            setRowSelected={setRowSelected}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface ReviewRowProps {
  idx: number;
  r: ResolvedLlmEntry;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  quadrantById: Map<string, RadarQuadrant>;
  ringById: Map<string, RadarRing>;
  topicById: Map<string, TopicForTopicsPage>;
  updateEntry: (idx: number, patch: Partial<ResolvedLlmEntry>) => void;
  startEdit: (idx: number) => void;
  commitEdit: (idx: number) => void;
  cancelEdit: (idx: number) => void;
  updateDraft: (idx: number, patch: Partial<EditDraft>) => void;
  setRowSelected: (idx: number, selected: boolean) => void;
}

// Row background tint signalling the row's resolution state.
function rowToneClass(r: ResolvedLlmEntry): string {
  if (r.resolution === "skip") return "opacity-60";
  if (r.problems.length > 0) return "bg-destructive/10";
  if (r.resolution === "removeBlip") return "bg-red-50/40";
  if (r.existingBlipId !== null) return "bg-amber-50/40";
  return "";
}

function ReviewRow({
  idx,
  r,
  quadrants,
  rings,
  quadrantById,
  ringById,
  topicById,
  updateEntry,
  startEdit,
  commitEdit,
  cancelEdit,
  updateDraft,
  setRowSelected,
}: ReviewRowProps) {
  const isSkipped = r.resolution === "skip";
  const isRemove = r.resolution === "removeBlip";
  const conflicts = r.existingBlipId !== null;
  // Description is unaffected by removal — when removing, only the blip goes
  // away, not the topic by default.
  const placementEditable = r.editing && !isSkipped && !isRemove;

  return (
    <TableRow className={rowToneClass(r)}>
      <TableCell className="align-top">
        <input
          type="checkbox"
          aria-label={r.selected ? "Deselect row" : "Select row"}
          checked={r.selected}
          onChange={e => setRowSelected(idx, e.target.checked)}
        />
      </TableCell>

      <TopicCell
        r={r}
        conflicts={conflicts}
        isSkipped={isSkipped}
      />

      <TableCell className="align-top">
        <DiffCell
          existingValue={r.willCreateTopic ? null : r.existingTopicDescription}
          newValue={r.description}
          showDiff={descriptionChanged(r)}
          editing={r.editing && !isSkipped}
          draftValue={r.editDraft?.description ?? ""}
          onDraftChange={value => updateDraft(idx, {
            description: value,
          })}
          multiline
        />
      </TableCell>

      <PlacementTableCell
        isRemove={isRemove}
        editing={placementEditable}
        existingId={r.existingQuadrantId}
        newId={r.quadrantId}
        newInput={r.quadrantInput}
        byId={quadrantById}
        options={quadrants}
        showDiff={quadrantChanged(r)}
        draftId={r.editDraft?.quadrantId ?? ""}
        onDraftChange={value => updateDraft(idx, {
          quadrantId: value,
        })}
      />

      <PlacementTableCell
        isRemove={isRemove}
        editing={placementEditable}
        existingId={r.existingRingId}
        newId={r.ringId}
        newInput={r.ringInput}
        byId={ringById}
        options={rings}
        showDiff={ringChanged(r)}
        draftId={r.editDraft?.ringId ?? ""}
        onDraftChange={value => updateDraft(idx, {
          ringId: value,
        })}
      />

      <TableCell className="align-top">
        <DiffCell
          existingValue={r.existingRadarNote}
          newValue={r.radarNote}
          showDiff={radarNoteChanged(r)}
          editing={r.editing && !isSkipped && !isRemove}
          draftValue={r.editDraft?.radarNote ?? ""}
          onDraftChange={value => updateDraft(idx, {
            radarNote: value,
          })}
          multiline
        />
      </TableCell>

      <EditActionsCell
        idx={idx}
        editing={r.editing}
        isSkipped={isSkipped}
        startEdit={startEdit}
        commitEdit={commitEdit}
        cancelEdit={cancelEdit}
      />

      <ResolutionCell
        idx={idx}
        r={r}
        conflicts={conflicts}
        isRemove={isRemove}
        topic={r.matchedTopicId ? topicById.get(r.matchedTopicId) : null}
        updateEntry={updateEntry}
      />
    </TableRow>
  );
}

// Topic name + provenance tags ("New topic" / "Existing topic" / "On radar")
// and any validation problems.
function TopicCell({
  r,
  conflicts,
  isSkipped,
}: {
  r: ResolvedLlmEntry;
  conflicts: boolean;
  isSkipped: boolean;
}) {
  return (
    <TableCell className="align-top">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{r.topicName || "(no topic)"}</span>
        <div className="flex flex-row flex-wrap gap-1">
          {r.willCreateTopic && (
            <span
              className={`
                rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[10px]
                text-emerald-800
              `}
            >
              New topic
            </span>
          )}
          {!r.willCreateTopic && r.matchedTopicId && (
            <span
              className={`
                rounded-sm bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-800
              `}
            >
              Existing topic
            </span>
          )}
          {conflicts && (
            <span
              className={`
                rounded-sm bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-900
              `}
            >
              On radar
            </span>
          )}
        </div>
        {r.problems.length > 0 && !isSkipped && (
          <span className="text-[11px] text-destructive">
            {r.problems.join("; ")}
          </span>
        )}
      </div>
    </TableCell>
  );
}

// Quadrant/ring placement cell. Renders a dash when the blip is being removed,
// otherwise a diff-aware <PlacementCell> resolved against the lookup map.
function PlacementTableCell({
  isRemove,
  editing,
  existingId,
  newId,
  newInput,
  byId,
  options,
  showDiff,
  draftId,
  onDraftChange,
}: {
  isRemove: boolean;
  editing: boolean;
  existingId: string | null;
  newId: string | null;
  newInput: string;
  byId: Map<string, { id: string;
    name: string; }>;
  options: { id: string;
    name: string; }[];
  showDiff: boolean;
  draftId: string;
  onDraftChange: (value: string) => void;
}) {
  if (isRemove) {
    return (
      <TableCell className="align-top">
        <span className="text-xs text-muted-foreground">—</span>
      </TableCell>
    );
  }
  const existingName = existingId ? byId.get(existingId)?.name ?? "?" : null;
  const newName = newId ? byId.get(newId)?.name ?? newInput : newInput;
  return (
    <TableCell className="align-top">
      <PlacementCell
        existingName={existingName}
        newName={newName}
        showDiff={showDiff}
        editing={editing}
        draftId={draftId}
        options={options}
        onDraftChange={onDraftChange}
      />
    </TableCell>
  );
}

// Edit / commit / cancel actions for a review row.
function EditActionsCell({
  idx,
  editing,
  isSkipped,
  startEdit,
  commitEdit,
  cancelEdit,
}: {
  idx: number;
  editing: boolean;
  isSkipped: boolean;
  startEdit: (idx: number) => void;
  commitEdit: (idx: number) => void;
  cancelEdit: (idx: number) => void;
}) {
  return (
    <TableCell className="align-top">
      {!editing
        ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => startEdit(idx)}
            disabled={isSkipped}
            aria-label="Edit"
          >
            <PencilIcon />
          </Button>
        )
        : (
          <div className="flex flex-row gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => commitEdit(idx)}
              aria-label="Commit edit"
            >
              <CheckIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => cancelEdit(idx)}
              aria-label="Discard edit"
            >
              <XIcon />
            </Button>
          </div>
        )}
    </TableCell>
  );
}

// Resolution <Select> plus the optional "also delete topic" toggle shown when
// removing a blip whose topic is unused elsewhere.
function ResolutionCell({
  idx,
  r,
  conflicts,
  isRemove,
  topic,
  updateEntry,
}: {
  idx: number;
  r: ResolvedLlmEntry;
  conflicts: boolean;
  isRemove: boolean;
  topic: TopicForTopicsPage | null | undefined;
  updateEntry: (idx: number, patch: Partial<ResolvedLlmEntry>) => void;
}) {
  const canDeleteTopic
    = isRemove
      && r.matchedTopicId !== null
      && r.topicCourseCount === 0
      && r.topicTaskCount === 0
      && r.topicDailyCount === 0;

  return (
    <TableCell className="align-top">
      <div className="flex flex-col gap-1">
        <Select
          value={r.resolution}
          onValueChange={value =>
            updateEntry(idx, {
              resolution: value as Resolution,
            })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conflicts
              ? (
                <>
                  <SelectItem value="overwriteAll">Overwrite All</SelectItem>
                  <SelectItem value="updateBlip">Update Blip</SelectItem>
                  <SelectItem value="removeBlip">Remove Blip</SelectItem>
                  <SelectItem value="skip">Skip</SelectItem>
                </>
              )
              : (
                <>
                  <SelectItem value="create">Add Blip</SelectItem>
                  <SelectItem value="skip">Skip</SelectItem>
                </>
              )}
          </SelectContent>
        </Select>
        {isRemove && r.matchedTopicId && (
          <label
            className={`
              flex flex-row items-center gap-1 text-[11px]
              ${canDeleteTopic ? "" : "text-muted-foreground"}
            `}
            title={
              canDeleteTopic
                ? undefined
                : `Topic has ${r.topicCourseCount} course(s), ${r.topicTaskCount} task(s), ${r.topicDailyCount} daily/dailies — keep`
            }
          >
            <input
              type="checkbox"
              checked={r.deleteTopicOnRemove}
              disabled={!canDeleteTopic}
              onChange={e => updateEntry(idx, {
                deleteTopicOnRemove: e.target.checked,
              })}
            />
            Also delete topic
            {!canDeleteTopic && topic && (
              <span className="text-[10px]">
                {" "}
                (in use)
              </span>
            )}
          </label>
        )}
      </div>
    </TableCell>
  );
}

interface DiffCellProps {
  existingValue: string | null;
  newValue: string | null;
  showDiff: boolean;
  editing: boolean;
  draftValue: string;
  onDraftChange: (value: string) => void;
  multiline?: boolean;
}

function DiffCell({
  existingValue,
  newValue,
  showDiff,
  editing,
  draftValue,
  onDraftChange,
  multiline,
}: DiffCellProps) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      {showDiff && (
        <span className="text-muted-foreground/70 italic line-through">
          {existingValue || "(none)"}
        </span>
      )}
      <span>
        {newValue || (
          <span className="text-muted-foreground italic">(none)</span>
        )}
      </span>
      {editing && (
        multiline
          ? (
            <Textarea
              value={draftValue}
              onChange={e => onDraftChange(e.target.value)}
              className="mt-1 min-h-16 text-xs"
            />
          )
          : (
            <Input
              value={draftValue}
              onChange={e => onDraftChange(e.target.value)}
              className="mt-1"
            />
          )
      )}
    </div>
  );
}

interface PlacementCellProps {
  existingName: string | null;
  newName: string | null;
  showDiff: boolean;
  editing: boolean;
  draftId: string;
  options: { id: string;
    name: string; }[];
  onDraftChange: (value: string) => void;
}

function PlacementCell({
  existingName,
  newName,
  showDiff,
  editing,
  draftId,
  options,
  onDraftChange,
}: PlacementCellProps) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      {showDiff
        ? (
          <span className="flex flex-row items-center gap-1">
            <span className="text-muted-foreground/70 line-through">
              {existingName ?? "(none)"}
            </span>
            <span aria-hidden>→</span>
            <span>{newName || "(none)"}</span>
          </span>
        )
        : (
          <span>
            {newName || (
              <span className="text-muted-foreground italic">(none)</span>
            )}
          </span>
        )}
      {editing && (
        <Select
          value={draftId}
          onValueChange={onDraftChange}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {options.map(o => (
              <SelectItem
                key={o.id}
                value={o.id}
              >{o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
