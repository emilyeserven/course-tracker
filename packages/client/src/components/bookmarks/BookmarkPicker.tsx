import type { TaskBookmark } from "@emstack/types";

import { BookmarkChip } from "./BookmarkChip";
import { BookmarkSearchDropdown } from "./BookmarkSearchDropdown";

import { Input } from "@/components/ui/input";
import { useBookmarkPicker } from "@/hooks/useBookmarkPicker";

interface BookmarkPickerProps {
  value: TaskBookmark[];
  onChange: (next: TaskBookmark[]) => void;
}

// Associates a task with Simple Bookmarks bookmarks. Search existing bookmarks
// by title/URL, or paste a URL to resolve it (creating the bookmark in Simple
// Bookmarks when it isn't saved yet).
export function BookmarkPicker({
  value, onChange,
}: BookmarkPickerProps) {
  const {
    inputValue,
    setInputValue,
    trimmed,
    looksLikeUrl,
    isAdding,
    error,
    isFetching,
    isError,
    availableResults,
    showDropdown,
    add,
    remove,
    setSection,
    addByUrl,
  } = useBookmarkPicker(value, onChange);

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map(b => (
            <BookmarkChip
              key={b.bookmarkId}
              association={b}
              onRemove={() => remove(b.bookmarkId)}
              onChangeSection={(sectionId, sectionLabel) =>
                setSection(b.bookmarkId, sectionId, sectionLabel)}
            />
          ))}
        </ul>
      )}

      <div className="relative">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && looksLikeUrl) {
              e.preventDefault();
              void addByUrl();
            }
          }}
          placeholder="Search bookmarks or paste a URL..."
        />

        {showDropdown && (
          <BookmarkSearchDropdown
            trimmed={trimmed}
            looksLikeUrl={looksLikeUrl}
            isAdding={isAdding}
            isFetching={isFetching}
            isError={isError}
            results={availableResults}
            onAddByUrl={() => void addByUrl()}
            onSelect={add}
          />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
