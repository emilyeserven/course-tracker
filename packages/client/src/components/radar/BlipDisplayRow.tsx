import type {
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { Link } from "@tanstack/react-router";
import {
  BookOpenIcon,
  EyeOffIcon,
  ListChecksIcon,
  Loader2,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SunIcon,
  TrashIcon,
  Undo2Icon,
} from "lucide-react";

import { Pill } from "@/components/radar/Pill";
import {
  pillClassByIndex,
  RING_PILL_CLASSES,
  SLICE_PILL_CLASSES,
} from "@/components/radar/radarColors";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";

interface BlipDisplayRowProps {
  blip: RadarBlip;
  topic: TopicForTopicsPage | undefined;
  quadrantById: Map<string, RadarQuadrant>;
  ringById: Map<string, RadarRing>;
  isSelected: boolean;
  isPending: boolean;
  editingLocked: boolean;
  showItemsColumn: boolean;
  onToggleSelected: () => void;
  onStartEdit: () => void;
  onToggleIgnore: () => void;
  onRemove: () => void;
}

export function BlipDisplayRow({
  blip,
  topic,
  quadrantById,
  ringById,
  isSelected,
  isPending,
  editingLocked,
  showItemsColumn,
  onToggleSelected,
  onStartEdit,
  onToggleIgnore,
  onRemove,
}: BlipDisplayRowProps) {
  return (
    <TableRow
      className="group"
      data-state={isSelected ? "selected" : undefined}
    >
      <TableCell>
        <input
          type="checkbox"
          aria-label={`Select ${blip.topicName}`}
          checked={isSelected}
          onChange={onToggleSelected}
        />
      </TableCell>
      <TableCell className="font-medium">{blip.topicName}</TableCell>
      <TableCell>
        {(() => {
          if (blip.isIgnored) {
            return <Pill className="bg-gray-200 text-gray-700">Ignored</Pill>;
          }
          const q = blip.quadrantId
            ? quadrantById.get(blip.quadrantId)
            : undefined;
          if (!q) {
            return (
              <span className="text-xs text-muted-foreground italic">
                unassigned
              </span>
            );
          }
          return (
            <Pill className={pillClassByIndex(SLICE_PILL_CLASSES, q.position)}>
              {q.name}
            </Pill>
          );
        })()}
      </TableCell>
      <TableCell>
        {(() => {
          if (blip.isIgnored) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          const r = blip.ringId ? ringById.get(blip.ringId) : undefined;
          if (!r) {
            return (
              <span className="text-xs text-muted-foreground italic">
                unassigned
              </span>
            );
          }
          return (
            <Pill className={pillClassByIndex(RING_PILL_CLASSES, r.position)}>
              {r.name}
            </Pill>
          );
        })()}
      </TableCell>
      <TableCell
        className="max-w-xs text-sm whitespace-pre-wrap text-muted-foreground"
      >
        {blip.description?.trim() || "—"}
      </TableCell>
      {showItemsColumn && (
        <TableCell className="text-sm text-muted-foreground">
          {topic
            ? (
              <div className="flex flex-row flex-wrap gap-2">
                <TopicItemLink
                  label="C"
                  title="Resources for this topic"
                  count={topic.resourceCount ?? 0}
                  to="/resources"
                  topicId={blip.topicId}
                />
                <TopicItemLink
                  label="T"
                  title="Tasks for this topic"
                  count={topic.taskCount ?? 0}
                  to="/tasks"
                  topicId={blip.topicId}
                />
                <TopicItemLink
                  label="D"
                  title="Dailies for this topic"
                  count={topic.dailyCount ?? 0}
                  to="/routines/tracker"
                  topicId={blip.topicId}
                />
              </div>
            )
            : (
              "—"
            )}
        </TableCell>
      )}
      <TableCell className="text-right">
        <div
          className={`
            flex flex-row items-center justify-end gap-1 opacity-0
            transition-opacity
            group-focus-within:opacity-100
            group-hover:opacity-100
          `}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending || editingLocked}
            aria-label="Edit blip"
            onClick={onStartEdit}
          >
            <PencilIcon />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending || editingLocked}
                aria-label="More actions"
              >
                {isPending
                  ? (
                    <Loader2 className="animate-spin" />
                  )
                  : (
                    <MoreHorizontalIcon />
                  )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs">
                Quick Create
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  to="/routines/$id/edit"
                  params={{
                    id: "new",
                  }}
                  search={{
                    topicId: blip.topicId,
                    mode: "daily",
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
                  to="/resources/$id/edit"
                  params={{
                    id: "new",
                  }}
                  search={{
                    topicId: blip.topicId,
                  }}
                >
                  <BookOpenIcon />
                  {" "}
                  Resource
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
              <DropdownMenuItem onClick={onToggleIgnore}>
                {blip.isIgnored
                  ? (
                    <>
                      <Undo2Icon />
                      {" "}
                      Move back to radar
                    </>
                  )
                  : (
                    <>
                      <EyeOffIcon />
                      {" "}
                      Mark as Ignored
                    </>
                  )}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={onRemove}
              >
                <TrashIcon />
                {" "}
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface TopicItemLinkProps {
  label: string;
  title: string;
  count: number;
  to: "/resources" | "/tasks" | "/routines/tracker";
  topicId: string;
}

function TopicItemLink({
  label,
  title,
  count,
  to,
  topicId,
}: TopicItemLinkProps) {
  if (count === 0) {
    return (
      <span
        title={title}
        className="text-muted-foreground/60"
      >
        {label}: 0
      </span>
    );
  }
  return (
    <Link
      to={to}
      search={{
        topicId,
      }}
      title={title}
      className={`
        font-medium text-blue-700
        hover:text-blue-500 hover:underline
      `}
    >
      {label}: {count}
    </Link>
  );
}
