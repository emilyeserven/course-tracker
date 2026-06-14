import type { Module, ModuleStatus } from "@emstack/types";
import type { CSSProperties } from "react";

import { formatModuleLength, formatPageRange } from "@emstack/types";
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  GripVerticalIcon,
  PencilIcon,
} from "lucide-react";

import { ModuleStatusControl } from "./ModuleStatusControl";

import { Button } from "@/components/ui/button";
import { isHttpUrl } from "@/utils";

export function ModuleDisplayRow({
  module: m,
  isAnyEditing,
  isReordering,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSetStatus,
  onOpenDetails,
  onEdit,
  onLogInteraction,
  isStatusPending,
  reorderMode = false,
  expandable = true,
  dragHandleProps,
  setNodeRef,
  dragStyle,
}: {
  module: Module;
  isAnyEditing: boolean;
  isReordering: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetStatus: (status: ModuleStatus) => void;
  onOpenDetails: () => void;
  onEdit: () => void;
  onLogInteraction: () => void;
  isStatusPending: boolean;
  /** When true, reveal the reorder controls (desktop handle / mobile arrows). */
  reorderMode?: boolean;
  /** When false, the name is plain text and the row can't open its details. */
  expandable?: boolean;
  /** dnd-kit drag handle `attributes` + `listeners`, spread onto the handle. */
  dragHandleProps?: Record<string, unknown>;
  /** dnd-kit sortable node ref for the row. */
  setNodeRef?: (el: HTMLElement | null) => void;
  /** dnd-kit transform/transition style for the row while dragging. */
  dragStyle?: CSSProperties;
}) {
  // Only a list with more than one item can be reordered.
  const canReorder = canMoveUp || canMoveDown;
  const showReorder = reorderMode && !isAnyEditing && canReorder;

  const nameContent = (
    <>
      <span
        className={
          m.status === "complete"
            ? "text-sm text-muted-foreground line-through"
            : "text-sm"
        }
      >
        {m.name}
      </span>
      {formatPageRange(m.pageStart, m.pageEnd) && (
        <span className="text-xs text-muted-foreground">
          {formatPageRange(m.pageStart, m.pageEnd)}
        </span>
      )}
      {formatModuleLength(m.length) && (
        <span className="text-xs text-muted-foreground">
          {formatModuleLength(m.length)}
        </span>
      )}
    </>
  );

  return (
    <li
      ref={setNodeRef}
      style={dragStyle}
      className="flex items-center justify-between gap-2 px-2 py-1.5"
    >
      <div className="flex flex-1 items-center gap-2">
        <ModuleStatusControl
          status={m.status}
          onChange={onSetStatus}
          disabled={isAnyEditing || isStatusPending}
        />
        {expandable
          ? (
            <button
              type="button"
              onClick={onOpenDetails}
              className="
                flex flex-1 cursor-pointer items-center gap-2 text-left
              "
              aria-label={`Open details for ${m.name}`}
            >
              {nameContent}
            </button>
          )
          : (
            <div className="flex flex-1 items-center gap-2 text-left">
              {nameContent}
            </div>
          )}
      </div>
      <div className="flex items-center gap-0.5">
        {m.url && isHttpUrl(m.url) && (
          <Button
            asChild
            size="sm"
            variant="outline"
          >
            <a
              href={m.url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
            >
              Go
              <ExternalLinkIcon className="size-3.5" />
            </a>
          </Button>
        )}
        {showReorder && (
          <>
            <span
              className="
                flex items-center gap-0.5
                md:hidden
              "
            >
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={onMoveUp}
                disabled={isReordering || !canMoveUp}
                aria-label="Move up"
                title="Move up"
              >
                <ChevronUpIcon className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={onMoveDown}
                disabled={isReordering || !canMoveDown}
                aria-label="Move down"
                title="Move down"
              >
                <ChevronDownIcon className="size-3.5" />
              </Button>
            </span>
            <button
              type="button"
              {...dragHandleProps}
              onClick={e => e.stopPropagation()}
              aria-label={`Drag to reorder ${m.name}`}
              title="Drag to reorder"
              className="
                hidden size-7 cursor-grab touch-none items-center justify-center
                rounded-md text-muted-foreground
                hover:bg-accent
                active:cursor-grabbing
                md:inline-flex
              "
            >
              <GripVerticalIcon className="size-3.5" />
            </button>
          </>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onLogInteraction}
          disabled={isAnyEditing}
          aria-label={`Log interaction for ${m.name}`}
          title="Log interaction"
        >
          <ActivityIcon className="size-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          disabled={isAnyEditing}
        >
          <PencilIcon className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}
