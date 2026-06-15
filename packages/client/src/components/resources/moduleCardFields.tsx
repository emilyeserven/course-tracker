import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";

/** Label + control wrapper shared by the module/group edit-card fields. */
export function CardField({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

/** A labeled single-line text input — the most common edit-card field. */
export function CardTextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  autoFocus = false,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <CardField label={label}>
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
      />
    </CardField>
  );
}

/**
 * The URL/Location field plus, for paged (book) resources, a start/end page
 * grid. Rendered identically by the module and group edit cards, so it lives
 * here rather than being duplicated in each.
 */
export function CardLocationAndPages({
  showPages,
  url,
  pageStart,
  pageEnd,
  onChange,
}: {
  showPages: boolean;
  url: string;
  pageStart: string;
  pageEnd: string;
  onChange: (patch: {
    url?: string;
    pageStart?: string;
    pageEnd?: string;
  }) => void;
}) {
  return (
    <>
      <CardTextField
        label={showPages ? "URL (optional)" : "Location (optional)"}
        value={url}
        onChange={value => onChange({
          url: value,
        })}
      />
      {showPages && (
        <div className="grid grid-cols-2 gap-2">
          <CardField label="Start page (optional)">
            <Input
              type="number"
              min={0}
              step={1}
              value={pageStart}
              onChange={e => onChange({
                pageStart: e.target.value,
              })}
              placeholder="e.g. 42"
            />
          </CardField>
          <CardField label="End page (optional)">
            <Input
              type="number"
              min={0}
              step={1}
              value={pageEnd}
              onChange={e => onChange({
                pageEnd: e.target.value,
              })}
              placeholder="e.g. 58"
            />
          </CardField>
        </div>
      )}
    </>
  );
}
