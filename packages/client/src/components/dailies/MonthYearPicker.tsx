import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ViewMonth {
  year: number;
  month: number;
}

interface MonthYearPickerProps {
  viewMonth: ViewMonth;
  currentMonth: ViewMonth;
  earliestYear: number;
  onChange: (m: ViewMonth) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isAfterMonth(a: ViewMonth, b: ViewMonth): boolean {
  return a.year > b.year || (a.year === b.year && a.month > b.month);
}

export function MonthYearPicker({
  viewMonth,
  currentMonth,
  earliestYear,
  onChange,
}: MonthYearPickerProps) {
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentMonth.year; y >= earliestYear; y--) {
      years.push(y);
    }
    return years;
  }, [currentMonth.year, earliestYear]);

  const monthDisabled = (year: number, month: number): boolean => {
    return isAfterMonth({
      year,
      month,
    }, currentMonth);
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <Select
        value={String(viewMonth.month)}
        onValueChange={(v) => {
          const month = Number.parseInt(v, 10);
          if (monthDisabled(viewMonth.year, month)) {
            return;
          }
          onChange({
            year: viewMonth.year,
            month,
          });
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTH_NAMES.map((name, i) => (
            <SelectItem
              key={name}
              value={String(i)}
              disabled={monthDisabled(viewMonth.year, i)}
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(viewMonth.year)}
        onValueChange={(v) => {
          const year = Number.parseInt(v, 10);
          let month = viewMonth.month;
          if (monthDisabled(year, month)) {
            month = currentMonth.month;
          }
          onChange({
            year,
            month,
          });
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map(year => (
            <SelectItem
              key={year}
              value={String(year)}
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
