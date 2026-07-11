import type { TaskBookmark } from "@emstack/types";

import { BookmarkPicker } from "./BookmarkPicker";

// The flat, string-only shape a schedule row / entry stores for a bookmark
// ("" = none). Shared by the weekly, curated, and Daily-mode entry editors.
export interface SingleBookmarkValue {
  bookmarkId: string;
  title: string;
  url: string;
  sectionId: string;
  sectionLabel: string;
}

const EMPTY: SingleBookmarkValue = {
  bookmarkId: "",
  title: "",
  url: "",
  sectionId: "",
  sectionLabel: "",
};

interface SingleBookmarkPickerProps {
  value: SingleBookmarkValue;
  onChange: (next: SingleBookmarkValue) => void;
}

// A single-slot wrapper over the multi-select BookmarkPicker: keeps only the
// most-recently chosen bookmark, for surfaces that reference exactly one (a
// routine weekly / curated / daily schedule entry). Converts between the
// string-only row shape and BookmarkPicker's TaskBookmark[].
export function SingleBookmarkPicker({
  value,
  onChange,
}: SingleBookmarkPickerProps) {
  const pickerValue: TaskBookmark[] = value.bookmarkId
    ? [{
      bookmarkId: value.bookmarkId,
      title: value.title,
      url: value.url || null,
      sectionId: value.sectionId || null,
      sectionLabel: value.sectionLabel || null,
    }]
    : [];

  return (
    <BookmarkPicker
      value={pickerValue}
      onChange={(next) => {
        const last = next[next.length - 1];
        onChange(
          last
            ? {
              bookmarkId: last.bookmarkId,
              title: last.title,
              url: last.url ?? "",
              sectionId: last.sectionId ?? "",
              sectionLabel: last.sectionLabel ?? "",
            }
            : EMPTY,
        );
      }}
    />
  );
}
