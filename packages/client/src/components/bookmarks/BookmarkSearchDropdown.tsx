import type { BookmarkSummary } from "@emstack/types";

import { Loader2, PlusIcon } from "lucide-react";

interface BookmarkSearchDropdownProps {
  // The trimmed input text (shown in the add-by-URL row).
  trimmed: string;
  looksLikeUrl: boolean;
  isAdding: boolean;
  isFetching: boolean;
  isError: boolean;
  results: BookmarkSummary[];
  onAddByUrl: () => void;
  onSelect: (bookmark: BookmarkSummary) => void;
}

// The BookmarkPicker's results dropdown: an add-by-URL action when the input
// looks like a URL, otherwise the search states (loading / unreachable /
// empty / matches).
export function BookmarkSearchDropdown({
  trimmed,
  looksLikeUrl,
  isAdding,
  isFetching,
  isError,
  results,
  onAddByUrl,
  onSelect,
}: BookmarkSearchDropdownProps) {
  return (
    <div
      className="
        mt-1 rounded-md border border-border bg-popover p-1 text-sm shadow-md
      "
    >
      {looksLikeUrl
        ? (
          <button
            type="button"
            disabled={isAdding}
            onClick={onAddByUrl}
            className="
              flex w-full items-center gap-2 rounded-sm p-2 text-left
              hover:bg-accent hover:text-accent-foreground
              disabled:opacity-50
            "
          >
            {isAdding
              ? (
                <Loader2 className="size-4 animate-spin" />
              )
              : (
                <PlusIcon className="size-4" />
              )}
            <span>
              Add bookmark for
              {" "}
              <strong className="break-all">{trimmed}</strong>
            </span>
          </button>
        )
        : isFetching
          ? (
            <div
              className="flex items-center gap-2 p-2 text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" />
              Searching…
            </div>
          )
          : isError
            ? (
              <div className="p-2 text-muted-foreground">
                Simple Bookmarks is unreachable.
              </div>
            )
            : results.length === 0
              ? (
                <div className="p-2 text-muted-foreground">
                  No bookmarks found. Paste a URL to add one.
                </div>
              )
              : (
                <ul>
                  {results.map(r => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(r)}
                        className="
                          flex w-full flex-col items-start rounded-sm p-2
                          text-left
                          hover:bg-accent hover:text-accent-foreground
                        "
                      >
                        <span>{r.title}</span>
                        {r.url && (
                          <span
                            className="text-xs break-all text-muted-foreground"
                          >
                            {r.url}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
    </div>
  );
}
