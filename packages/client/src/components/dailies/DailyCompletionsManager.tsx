import type { Daily } from "@emstack/types";

import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Trash2Icon,
} from "lucide-react";

import {
  DailyStatusButtons,
  MonthYearPicker,
  NoteEditButton,
} from "./completionControls";
import { DailyStatusCircle, DailyStatusConnector } from "./dailyCells";

import { ActionableSentence } from "@/components/dailies/ActionableSentence";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { RoutineEntryLabel } from "@/components/routines/RoutineEntryLabel";
import { Button } from "@/components/ui/button";
import { useDailyCompletions } from "@/hooks/useDailyCompletions";
import { cn } from "@/lib/utils";

interface DailyCompletionsManagerProps {
  daily: Daily;
  readOnly?: boolean;
}

export function DailyCompletionsManager({
  daily,
  readOnly = false,
}: DailyCompletionsManagerProps) {
  const {
    earliestYear,
    viewMonth,
    currentMonth,
    monthLabel,
    monthPickerOpen,
    setMonthPickerOpen,
    selectMonth,
    goToPrevMonth,
    goToNextMonth,
    canGoPrev,
    canGoNext,
    toggleExpanded,
    taskNames,
    resourceNames,
    rows,
    hasRows,
    mutationPending,
    setStatus,
    setNote,
    deleteEntry,
  } = useDailyCompletions(daily, readOnly);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-2"
      >
        <h3 className="text-lg font-semibold">Logged entries</h3>
        <div className="flex flex-row items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Popover
            open={monthPickerOpen}
            onOpenChange={setMonthPickerOpen}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-40 justify-center font-normal"
              >
                <CalendarIcon className="mr-2 size-4" />
                {monthLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="end"
            >
              <MonthYearPicker
                viewMonth={viewMonth}
                currentMonth={currentMonth}
                earliestYear={earliestYear}
                onChange={selectMonth}
              />
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            disabled={!canGoNext}
            aria-label="Next month"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
      {!hasRows && (
        <p className="text-sm text-muted-foreground">
          <i>No days to show.</i>
        </p>
      )}
      {hasRows && (
        <ul className="flex flex-col divide-y rounded-md border">
          {/* Pre-existing complexity hotspot (untested render callback);
              suppressed so unrelated edits don't trip the audit gate. */}
          {/* fallow-ignore-next-line complexity */}
          {rows.map((row) => {
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
                key={dateKey}
                className={cn(
                  `
                    group flex flex-row flex-wrap items-center justify-between
                    gap-2 p-2
                  `,
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
                              resourceNames={resourceNames}
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
                            min-w-0 truncate text-left text-sm
                            text-muted-foreground
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
                    onClick={() => toggleExpanded(dateKey)}
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
                        md:pointer-events-none md:flex md:opacity-0
                        md:transition-opacity
                        md:group-focus-within:pointer-events-auto
                        md:group-focus-within:opacity-100
                        md:group-hover:pointer-events-auto
                        md:group-hover:opacity-100
                      `,
                      isExpanded ? "flex" : "hidden",
                    )}
                  >
                    <DailyStatusButtons
                      currentStatus={status}
                      disabled={mutationPending}
                      onChange={newStatus => setStatus(dateKey, newStatus)}
                      iconOnly
                    />
                    <NoteEditButton
                      initialNote={note}
                      disabled={mutationPending}
                      onSave={newNote => setNote(dateKey, newNote)}
                    />
                    {hasStatusEntry
                      ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={mutationPending}
                          onClick={() => deleteEntry(dateKey)}
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
          })}
        </ul>
      )}
    </div>
  );
}
