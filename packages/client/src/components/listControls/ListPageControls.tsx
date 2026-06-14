import { SearchIcon, XIcon } from "lucide-react";

import { FilterOptionCount } from "@/components/listControls/FilterOptionCount";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Search box for a list page's filter bar.
export function ListSearchInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <SearchIcon
        className="
          absolute top-1/2 left-2.5 size-4 -translate-y-1/2
          text-muted-foreground
        "
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="
          h-9 rounded-md border border-input bg-transparent pr-3 pl-8 text-sm
          shadow-xs transition-[color,box-shadow] outline-none
          placeholder:text-muted-foreground
          focus-visible:border-ring focus-visible:ring-[3px]
          focus-visible:ring-ring/50
        "
      />
    </div>
  );
}

export interface FilterSelectOption {
  value: string;
  label: string;
  count: number;
  // Optional uppercase tag shown before the label (e.g. a routine's type).
  prefix?: string;
}

// Topic/provider/domain/connection filter dropdown for a list page's filter
// bar: an "All" item with the total, an optional "None" item, then the options,
// each with a trailing count. Maps the sentinel "all" value to `undefined`.
export function FilterSelect({
  placeholder,
  value,
  onChange,
  allLabel,
  totalCount,
  noneLabel,
  noneCount,
  options,
}: {
  placeholder: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  allLabel: string;
  totalCount: number;
  noneLabel?: string;
  noneCount?: number;
  options: FilterSelectOption[];
}) {
  return (
    <Select
      value={value ?? "all"}
      onValueChange={v => onChange(v === "all" ? undefined : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <span>{allLabel}</span>
          <FilterOptionCount count={totalCount} />
        </SelectItem>
        {noneLabel && (noneCount ?? 0) > 0 && (
          <SelectItem value="none">
            <span>{noneLabel}</span>
            <FilterOptionCount count={noneCount ?? 0} />
          </SelectItem>
        )}
        {options.map(opt => (
          <SelectItem
            key={opt.value}
            value={opt.value}
          >
            {opt.prefix && (
              <span className="mr-1 text-xs text-muted-foreground uppercase">
                {opt.prefix}
              </span>
            )}
            <span>{opt.label}</span>
            <FilterOptionCount count={opt.count} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// "Clear filters" action for a list page's filter bar.
export function ClearFiltersButton({
  onClick,
}: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
    >
      <XIcon className="size-4" />
      Clear filters
    </Button>
  );
}

// Empty / no-match placeholders for a filterable list page.
export function ListEmptyStates({
  entityLabel,
  total,
  filteredCount,
}: {
  entityLabel: string;
  total: number;
  filteredCount: number;
}) {
  return (
    <>
      {total === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>
            No
            {" "}
            {entityLabel}
            {" "}
            yet!
          </i>
        </p>
      )}
      {total > 0 && filteredCount === 0 && (
        <div className="text-muted-foreground">
          <i>
            No
            {" "}
            {entityLabel}
            {" "}
            match your filters.
          </i>
        </div>
      )}
    </>
  );
}
