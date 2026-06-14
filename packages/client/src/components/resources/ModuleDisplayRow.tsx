import type { Module, ModuleStatus } from "@emstack/types";

import { formatModuleLength, formatPageRange } from "@emstack/types";
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
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
}) {
  return (
    <li className="flex items-center justify-between gap-2 px-2 py-1.5">
      <div className="flex flex-1 items-center gap-2">
        <ModuleStatusControl
          status={m.status}
          onChange={onSetStatus}
          disabled={isAnyEditing || isStatusPending}
        />
        <button
          type="button"
          onClick={onOpenDetails}
          className="flex flex-1 items-center gap-2 text-left"
          aria-label={`Open details for ${m.name}`}
        >
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
        </button>
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
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onMoveUp}
          disabled={isAnyEditing || isReordering || !canMoveUp}
          aria-label="Move up"
          title="Move up"
        >
          <ChevronUpIcon className="size-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onMoveDown}
          disabled={isAnyEditing || isReordering || !canMoveDown}
          aria-label="Move down"
          title="Move down"
        >
          <ChevronDownIcon className="size-3.5" />
        </Button>
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
