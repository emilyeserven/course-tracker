import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

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
