import type { BookmarkSummary, TaskBookmark } from "@emstack/types";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  createBookmark,
  isHttpUrl,
  queryKeys,
  resolveBookmark,
  searchBookmarks,
} from "@/utils";

function toAssociation(b: BookmarkSummary): TaskBookmark {
  return {
    bookmarkId: b.id,
    title: b.title,
    url: b.url,
  };
}

// The BookmarkPicker's input state machine: debounced title/URL search against
// Simple Bookmarks, add/remove/section mutations on the association list, and
// the paste-a-URL path (resolve an existing bookmark, else create it). Returns
// presentational-ready flags so the component renders only JSX.
export function useBookmarkPicker(
  value: TaskBookmark[],
  onChange: (next: TaskBookmark[]) => void,
) {
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

  return {
    inputValue,
    setInputValue,
    trimmed,
    looksLikeUrl,
    isAdding,
    error,
    isFetching,
    isError,
    availableResults: results.filter(r => !selectedIds.has(r.id)),
    showDropdown: trimmed.length > 0,
    add,
    remove,
    setSection,
    addByUrl,
  };
}
