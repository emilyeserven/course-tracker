import type { ViewMonth } from "@/components/dailies/MonthYearPicker";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import { MonthYearPicker } from "./completionControls";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CompletionsMonthNavProps {
  viewMonth: ViewMonth;
  currentMonth: ViewMonth;
  earliestYear: number;
  monthLabel: string;
  monthPickerOpen: boolean;
  setMonthPickerOpen: (open: boolean) => void;
  selectMonth: (m: ViewMonth) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

// The logged-entries month switcher: prev/next arrows around a popover
// month-and-year picker, all driven by useDailyCompletions' month state.
export function CompletionsMonthNav({
  viewMonth,
  currentMonth,
  earliestYear,
  monthLabel,
  monthPickerOpen,
  setMonthPickerOpen,
  selectMonth,
  goToPrevMonth,
  goToNextMonth,
  canGoPrev,
  canGoNext,
}: CompletionsMonthNavProps) {
  return (
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
  );
}
