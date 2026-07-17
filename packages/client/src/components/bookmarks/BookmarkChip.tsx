import type { TaskBookmark } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { ExternalLinkIcon, XIcon } from "lucide-react";

import { OpenBookmarkPageButton } from "./OpenBookmarkPageButton";

import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";
import { fetchBookmarkSections, queryKeys } from "@/utils";

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
export function BookmarkChip({
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
