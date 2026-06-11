import type { Module } from "@emstack/types";

import { formatModuleLength } from "@emstack/types";
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  PencilIcon,
} from "lucide-react";

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
  onToggleComplete,
  onEdit,
  onLogInteraction,
  isToggling,
}: {
  module: Module;
  isAnyEditing: boolean;
  isReordering: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onLogInteraction: () => void;
  isToggling: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-2 px-2 py-1.5">
      <label className="flex flex-1 items-center gap-2">
        <input
          type="checkbox"
          checked={m.isComplete}
          onChange={onToggleComplete}
          disabled={isAnyEditing || isToggling}
          className="size-4"
        />
        <span
          className={
            m.isComplete
              ? "text-sm text-muted-foreground line-through"
              : "text-sm"
          }
        >
          {m.name}
        </span>
        {m.url && isHttpUrl(m.url) && (
          <a
            href={m.url}
            target="_blank"
            rel="noreferrer"
            className="
              text-xs text-muted-foreground
              hover:text-blue-600
            "
            onClick={e => e.stopPropagation()}
          >
            <ExternalLinkIcon className="inline size-3" />
          </a>
        )}
        {formatModuleLength(m.length) && (
          <span className="text-xs text-muted-foreground">
            {formatModuleLength(m.length)}
          </span>
        )}
      </label>
      <div className="flex items-center gap-0.5">
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
