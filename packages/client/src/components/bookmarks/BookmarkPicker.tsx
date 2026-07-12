import type { BookmarkSummary, TaskBookmark } from "@emstack/types";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ExternalLinkIcon, Loader2, PlusIcon, XIcon } from "lucide-react";

import { OpenBookmarkPageButton } from "./OpenBookmarkPageButton";

import { Input } from "@/components/ui/input";
import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";
import {
  createBookmark,
  fetchBookmarkSections,
  isHttpUrl,
  queryKeys,
  resolveBookmark,
  searchBookmarks,
} from "@/utils";

interface BookmarkPickerProps {
  value: TaskBookmark[];
  onChange: (next: TaskBookmark[]) => void;
}

function toAssociation(b: BookmarkSummary): TaskBookmark {
  return {
    bookmarkId: b.id,
    title: b.title,
    url: b.url,
  };
}

// Associates a task with Simple Bookmarks bookmarks. Search existing bookmarks
// by title/URL, or paste a URL to resolve it (creating the bookmark in Simple
// Bookmarks when it isn't saved yet). Coexists with the local Resources model
// during the incremental migration to bookmark-backed links.
export function BookmarkPicker({
  value, onChange,
}: BookmarkPickerProps) {
  const [inputValue, setInputValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(inputValue.trim()), 250);
    return () => clearTimeout(handle);
  }, [inputValue]);

  const trimmed = inputValue.trim();
  const looksLikeUrl = isHttpUrl(trimmed);
  const selectedIds = new Set(value.map(v => v.bookmarkId));

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: queryKeys.bookmarks.search(debounced),
    queryFn: () => searchBookmarks(debounced),
    // Skip the search while a URL is being pasted — that path resolves/creates
    // instead of listing matches.
    enabled: debounced.length > 0 && !isHttpUrl(debounced),
  });

  function add(bookmark: BookmarkSummary) {
    if (!selectedIds.has(bookmark.id)) {
      onChange([...value, toAssociation(bookmark)]);
    }
    setInputValue("");
    setDebounced("");
    setError(null);
  }

  function remove(bookmarkId: string) {
    onChange(value.filter(v => v.bookmarkId !== bookmarkId));
  }

  function setSection(
    bookmarkId: string,
    sectionId: string | null,
    sectionLabel: string | null,
  ) {
    onChange(
      value.map(v =>
        v.bookmarkId === bookmarkId
          ? {
            ...v,
            sectionId,
            sectionLabel,
          }
          : v),
    );
  }

  async function addByUrl() {
    if (!trimmed) return;
    setIsAdding(true);
    setError(null);
    try {
      // Resolve first so we reuse an existing bookmark instead of duplicating it;
      // create only when the URL isn't saved yet.
      const {
        bookmark,
      } = await resolveBookmark(trimmed);
      const resolved
        = bookmark
          ?? (await createBookmark({
            url: trimmed,
          }));
      add(resolved);
    }
    catch {
      setError("Couldn't reach Simple Bookmarks. Try again.");
    }
    finally {
      setIsAdding(false);
    }
  }

  const availableResults = results.filter(r => !selectedIds.has(r.id));
  const showDropdown = trimmed.length > 0;

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
          <div
            className="
              mt-1 rounded-md border border-border bg-popover p-1 text-sm
              shadow-md
            "
          >
            {looksLikeUrl
              ? (
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => void addByUrl()}
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
                    className="
                      flex items-center gap-2 p-2 text-muted-foreground
                    "
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
                  : availableResults.length === 0
                    ? (
                      <div className="p-2 text-muted-foreground">
                        No bookmarks found. Paste a URL to add one.
                      </div>
                    )
                    : (
                      <ul>
                        {availableResults.map(r => (
                          <li key={r.id}>
                            <button
                              type="button"
                              onClick={() => add(r)}
                              className="
                                flex w-full flex-col items-start rounded-sm p-2
                                text-left
                                hover:bg-accent hover:text-accent-foreground
                              "
                            >
                              <span>{r.title}</span>
                              {r.url && (
                                <span
                                  className="
                                    text-xs break-all text-muted-foreground
                                  "
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
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface BookmarkChipProps {
  association: TaskBookmark;
  onRemove: () => void;
  onChangeSection: (
    sectionId: string | null,
    sectionLabel: string | null,
  ) => void;
}

// A single associated-bookmark chip: title link, remove, and — when the bookmark
// has sections — a live-fetched dropdown to narrow the association to one section.
function BookmarkChip({
  association,
  onRemove,
  onChangeSection,
}: BookmarkChipProps) {
  const {
    data: sections = [],
  } = useQuery({
    queryKey: queryKeys.bookmarks.sections(association.bookmarkId),
    queryFn: () => fetchBookmarkSections(association.bookmarkId),
  });

  const {
    resolveHref,
  } = useBookmarkLinking();
  const linkable = {
    externalId: association.bookmarkId,
    url: association.url,
  };
  const href = resolveHref(linkable);

  return (
    <li
      className="
        flex items-center gap-1.5 rounded-md border border-border bg-muted px-2
        py-1 text-sm
      "
    >
      {href
        ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex items-center gap-1
              hover:underline
            "
          >
            {association.title}
            <ExternalLinkIcon className="size-3" />
          </a>
        )
        : (
          <span>{association.title}</span>
        )}
      <OpenBookmarkPageButton linkable={linkable} />

      {sections.length > 0 && (
        <select
          aria-label={`Section of ${association.title}`}
          value={association.sectionId ?? ""}
          onChange={(e) => {
            const id = e.target.value || null;
            const label = id
              ? (sections.find(s => s.id === id)?.label ?? null)
              : null;
            onChangeSection(id, label);
          }}
          className="rounded-sm border bg-background px-1 py-0.5 text-xs"
        >
          <option value="">Whole bookmark</option>
          {sections.map(s => (
            <option
              key={s.id}
              value={s.id}
            >
              {s.label}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${association.title}`}
        className="
          text-muted-foreground
          hover:text-foreground
        "
      >
        <XIcon className="size-3.5" />
      </button>
    </li>
  );
}
