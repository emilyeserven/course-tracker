import type { Daily } from "@emstack/types";

import { CompletionsMonthNav } from "./CompletionsMonthNav";
import { DailyCompletionEntryRow } from "./DailyCompletionEntryRow";

import { useDailyCompletions } from "@/hooks/useDailyCompletions";

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
        <CompletionsMonthNav
          viewMonth={viewMonth}
          currentMonth={currentMonth}
          earliestYear={earliestYear}
          monthLabel={monthLabel}
          monthPickerOpen={monthPickerOpen}
          setMonthPickerOpen={setMonthPickerOpen}
          selectMonth={selectMonth}
          goToPrevMonth={goToPrevMonth}
          goToNextMonth={goToNextMonth}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
        />
      </div>
      {!hasRows && (
        <p className="text-sm text-muted-foreground">
          <i>No days to show.</i>
        </p>
      )}
      {hasRows && (
        <ul className="flex flex-col divide-y rounded-md border">
          {rows.map(row => (
            <DailyCompletionEntryRow
              key={row.dateKey}
              row={row}
              taskNames={taskNames}
              mutationPending={mutationPending}
              onToggleExpanded={toggleExpanded}
              onSetStatus={setStatus}
              onSetNote={setNote}
              onDeleteEntry={deleteEntry}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
