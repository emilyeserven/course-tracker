import type { DailyCompletionRow } from "@/hooks/useDailyCompletions";
import type { DailyCompletionStatus } from "@emstack/types";

import { ChevronDownIcon, Trash2Icon } from "lucide-react";

import { DailyStatusButtons, NoteEditButton } from "./completionControls";
import { DailyStatusCircle, DailyStatusConnector } from "./dailyCells";

import { ActionableSentence } from "@/components/dailies/ActionableSentence";
import { RoutineEntryLabel } from "@/components/routines/RoutineEntryLabel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DailyCompletionEntryRowProps {
  row: DailyCompletionRow;
  // Resolves task ids in the live scheduled-entry fallback.
  taskNames: Map<string, string>;
  mutationPending: boolean;
  onToggleExpanded: (dateKey: string) => void;
  onSetStatus: (dateKey: string, status: DailyCompletionStatus | null) => void;
  onSetNote: (dateKey: string, note: string | null) => void;
  onDeleteEntry: (dateKey: string) => void;
}

// One date row of the logged-entries list: status circle + connector, date and
// resolved schedule label, note popover, and the (mobile-collapsible) status /
// note / delete actions.
export function DailyCompletionEntryRow({
  row,
  taskNames,
  mutationPending,
  onToggleExpanded,
  onSetStatus,
  onSetNote,
  onDeleteEntry,
}: DailyCompletionEntryRowProps) {
  const {
    dateKey,
    status,
    note,
    dateLabel,
    hasStatusEntry,
    isFuture,
    hasActions,
    isExpanded,
    showVerticalConnector,
    nextStatus,
    scheduledEntry,
    bakedParts,
  } = row;
  return (
    <li
      className={cn(
        "group flex flex-row flex-wrap items-center justify-between gap-2 p-2",
        isFuture && "opacity-60",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
        <div className="relative flex shrink-0 flex-col items-center">
          <DailyStatusCircle
            status={status}
            size="lg"
          />
          {showVerticalConnector && (
            <DailyStatusConnector
              orientation="vertical"
              left={status}
              right={nextStatus}
              className={cn(
                "absolute top-full z-0 h-[18px] w-0.5",
                isExpanded && "max-md:hidden",
              )}
            />
          )}
        </div>
        <div className="flex min-w-0 shrink-0 flex-col">
          <span className="text-sm font-medium">{dateLabel}</span>
          {/* Prefer the baked snapshot (frozen at save time); fall back
              to the live scheduled entry for unbaked/legacy rows. */}
          {bakedParts
            ? (
              <span className="text-xs text-muted-foreground">
                <ActionableSentence
                  prependText={bakedParts.prependText}
                  appendText={bakedParts.appendText}
                  name={bakedParts.name}
                />
              </span>
            )
            : scheduledEntry
              ? (
                <span className="text-xs text-muted-foreground">
                  <RoutineEntryLabel
                    entry={scheduledEntry}
                    taskNames={taskNames}
                    showMeta={false}
                  />
                </span>
              )
              : null}
        </div>
        {note && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="
                  min-w-0 truncate text-left text-sm text-muted-foreground
                  hover:text-foreground
                "
                title={note}
              >
                {note}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 max-w-[90vw]"
              align="start"
            >
              <p className="text-sm/relaxed whitespace-pre-wrap">
                {note}
              </p>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {hasActions && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onToggleExpanded(dateKey)}
          className="
            shrink-0
            md:hidden
          "
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Hide actions" : "Show actions"}
        >
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </Button>
      )}
      {hasActions && (
        <div
          className={cn(
            `
              flex-row items-center gap-1
              max-md:w-full max-md:justify-end
              md:pointer-events-none md:flex md:opacity-0 md:transition-opacity
              md:group-focus-within:pointer-events-auto
              md:group-focus-within:opacity-100
              md:group-hover:pointer-events-auto md:group-hover:opacity-100
            `,
            isExpanded ? "flex" : "hidden",
          )}
        >
          <DailyStatusButtons
            currentStatus={status}
            disabled={mutationPending}
            onChange={newStatus => onSetStatus(dateKey, newStatus)}
            iconOnly
          />
          <NoteEditButton
            initialNote={note}
            disabled={mutationPending}
            onSave={newNote => onSetNote(dateKey, newNote)}
          />
          {hasStatusEntry
            ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={mutationPending}
                onClick={() => onDeleteEntry(dateKey)}
                className="text-destructive"
                title="Delete entry"
                aria-label="Delete entry"
              >
                <Trash2Icon className="size-4" />
              </Button>
            )
            : (
              <div
                aria-hidden
                className="size-8"
              />
            )}
        </div>
      )}
    </li>
  );
}
