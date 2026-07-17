import type { TaskBookmark } from "@emstack/types";

import { ExternalLinkIcon } from "lucide-react";

import { OpenBookmarkPageButton } from "@/components/bookmarks";
import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";

interface TaskBookmarksListProps {
  bookmarks: TaskBookmark[];
}

// The task detail page's bookmark chip list: each chip links out to the
// bookmark (when resolvable), offers the open-page button, and shows the
// optional section suffix.
export function TaskBookmarksList({
  bookmarks,
}: TaskBookmarksListProps) {
  const {
    resolveHref,
  } = useBookmarkLinking();

  return (
    <ul className="flex flex-wrap gap-2">
      {bookmarks.map((b) => {
        const linkable = {
          externalId: b.bookmarkId,
          url: b.url,
        };
        const href = resolveHref(linkable);
        return (
          <li
            key={b.bookmarkId}
            className="
              flex items-center gap-1.5 rounded-md border border-border bg-muted
              px-2 py-1 text-sm
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
                  {b.title}
                  <ExternalLinkIcon className="size-3" />
                </a>
              )
              : (
                <span>{b.title}</span>
              )}
            <OpenBookmarkPageButton linkable={linkable} />
            {b.sectionLabel && (
              <span className="text-muted-foreground">
                › {b.sectionLabel}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
