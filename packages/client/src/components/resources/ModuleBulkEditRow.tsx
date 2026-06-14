import type { ModuleDraft } from "./moduleDrafts";
import type { ModuleRowDraft } from "@/hooks/useModuleBulkEditDrafts";
import type {
  ModuleDurationBucket,
  ModuleStatus,
  TagGroup,
} from "@emstack/types";

import {
  MODULE_DURATION_BUCKETS,
  MODULE_DURATION_LABELS,
} from "@emstack/types";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { LevelTriad } from "./LevelTriad";
import { ModuleStatusControl } from "./ModuleStatusControl";

import { TagPicker } from "@/components/tasks/TagPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const selectClass = `
  flex h-9 w-full rounded-md border bg-background px-2 py-1 text-sm
`;

export interface ModuleGroupOption {
  /** Empty string represents the "Ungrouped" choice (moduleGroupId === null). */
  value: string;
  label: string;
}

interface ModuleBulkEditRowProps {
  rowDraft: ModuleRowDraft;
  groupOptions: ModuleGroupOption[];
  tagGroups: TagGroup[];
  /** Book resources get the start/end page columns. */
  showPages: boolean;
  /** Total column count, for the expanded detail row's colSpan. */
  colCount: number;
  isDirty: boolean;
  expanded: boolean;
  disabled?: boolean;
  onToggleExpand: () => void;
  onPatchDraft: (patch: Partial<ModuleDraft>) => void;
  onPatchRow: (patch: {
    status?: ModuleStatus;
    moduleGroupId?: string | null;
  }) => void;
}

/**
 * One editable module row of the bulk-edit table: the scannable fields as inline
 * cells, plus a toggle that reveals a full-width sub-row for the bulkier effort
 * levels + tags controls. Pure/controlled — all state lives in the parent's
 * `useModuleBulkEditDrafts`.
 */
export function ModuleBulkEditRow({
  rowDraft,
  groupOptions,
  tagGroups,
  showPages,
  colCount,
  isDirty,
  expanded,
  disabled = false,
  onToggleExpand,
  onPatchDraft,
  onPatchRow,
}: ModuleBulkEditRowProps) {
  const {
    draft,
  } = rowDraft;

  return (
    <>
      <TableRow
        data-dirty={isDirty || undefined}
        className={cn(isDirty && `
          bg-amber-50/60
          dark:bg-amber-900/10
        `)}
      >
        <TableCell className="w-8 align-top">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-expanded={expanded}
            aria-label={expanded ? "Hide levels and tags" : "Edit levels and tags"}
            onClick={onToggleExpand}
          >
            {expanded
              ? <ChevronDownIcon className="size-4" />
              : <ChevronRightIcon className="size-4" />}
          </Button>
        </TableCell>

        <TableCell className="align-top">
          <select
            value={rowDraft.moduleGroupId ?? ""}
            disabled={disabled}
            aria-label="Group"
            className={selectClass}
            onChange={e =>
              onPatchRow({
                moduleGroupId: e.target.value || null,
              })}
          >
            {groupOptions.map(opt => (
              <option
                key={opt.value || "__ungrouped__"}
                value={opt.value}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </TableCell>

        <TableCell className="align-top">
          <Input
            type="text"
            value={draft.name}
            disabled={disabled}
            required
            aria-label="Module name"
            className="min-w-40"
            onChange={e =>
              onPatchDraft({
                name: e.target.value,
              })}
          />
        </TableCell>

        <TableCell className="align-top">
          <ModuleStatusControl
            status={rowDraft.status}
            disabled={disabled}
            onChange={status => onPatchRow({
              status,
            })}
          />
        </TableCell>

        <TableCell className="align-top">
          <div className="flex items-center gap-1">
            <div
              className="flex items-center rounded-md border border-input"
              role="group"
              aria-label="Length mode"
            >
              <Button
                type="button"
                size="sm"
                variant={draft.durationMode === "minutes" ? "secondary" : "ghost"}
                aria-pressed={draft.durationMode === "minutes"}
                disabled={disabled}
                onClick={() =>
                  onPatchDraft({
                    durationMode: "minutes",
                  })}
              >
                Min
              </Button>
              <Button
                type="button"
                size="sm"
                variant={draft.durationMode === "bucket" ? "secondary" : "ghost"}
                aria-pressed={draft.durationMode === "bucket"}
                disabled={disabled}
                onClick={() =>
                  onPatchDraft({
                    durationMode: "bucket",
                  })}
              >
                Range
              </Button>
            </div>
            {draft.durationMode === "minutes"
              ? (
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.minutesValue}
                  disabled={disabled}
                  aria-label="Length in minutes"
                  placeholder="min"
                  className="w-20"
                  onChange={e =>
                    onPatchDraft({
                      minutesValue: e.target.value,
                    })}
                />
              )
              : (
                <select
                  value={draft.bucketValue}
                  disabled={disabled}
                  aria-label="Length range"
                  className={selectClass}
                  onChange={e =>
                    onPatchDraft({
                      bucketValue: (e.target.value || "") as
                      | ModuleDurationBucket
                      | "",
                    })}
                >
                  <option value="">—</option>
                  {MODULE_DURATION_BUCKETS.map(b => (
                    <option
                      key={b}
                      value={b}
                    >
                      {MODULE_DURATION_LABELS[b]}
                    </option>
                  ))}
                </select>
              )}
          </div>
        </TableCell>

        {showPages && (
          <TableCell className="align-top">
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.pageStart}
                disabled={disabled}
                aria-label="Start page"
                placeholder="start"
                className="w-20"
                onChange={e =>
                  onPatchDraft({
                    pageStart: e.target.value,
                  })}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.pageEnd}
                disabled={disabled}
                aria-label="End page"
                placeholder="end"
                className="w-20"
                onChange={e =>
                  onPatchDraft({
                    pageEnd: e.target.value,
                  })}
              />
            </div>
          </TableCell>
        )}

        <TableCell className="align-top">
          <Input
            type="text"
            value={draft.url}
            disabled={disabled}
            aria-label={showPages ? "URL" : "Location"}
            className="min-w-40"
            onChange={e =>
              onPatchDraft({
                url: e.target.value,
              })}
          />
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow
          className={cn(isDirty && `
            bg-amber-50/60
            dark:bg-amber-900/10
          `)}
        >
          <TableCell />
          <TableCell colSpan={colCount - 1}>
            <div className="flex flex-col gap-3 pb-2">
              <LevelTriad
                easeOfStarting={draft.easeOfStarting}
                timeNeeded={draft.timeNeeded}
                interactivity={draft.interactivity}
                onChange={onPatchDraft}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Tags
                </span>
                <TagPicker
                  value={draft.tagIds}
                  tagGroups={tagGroups}
                  onChange={ids => onPatchDraft({
                    tagIds: ids,
                  })}
                />
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
