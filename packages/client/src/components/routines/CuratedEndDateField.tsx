import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CuratedEndDateFieldProps {
  value: Date | null;
  onSelect: (date: Date | null) => void;
  // Selectable window: [minDate, maxDate]. Dates outside are disabled.
  minDate: Date;
  maxDate: Date;
}

// End-date picker for a curated routine: a single date constrained to
// [today, today + 14 days]. Selecting/clearing flows back through `onSelect` so
// the Details tab can regenerate the per-date rows in the same update.
export function CuratedEndDateField({
  value,
  onSelect,
  minDate,
  maxDate,
}: CuratedEndDateFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">End date</span>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !value && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {value ? value.toLocaleDateString() : "Pick an end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
          >
            <Calendar
              mode="single"
              selected={value ?? undefined}
              defaultMonth={value ?? minDate}
              disabled={[{
                before: minDate,
              }, {
                after: maxDate,
              }]}
              onSelect={date => onSelect(date ?? null)}
            />
          </PopoverContent>
        </Popover>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelect(null)}
          >
            Clear
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Up to 14 days from today.
      </p>
    </div>
  );
}
