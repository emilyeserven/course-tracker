import type { BookmarkLinkable } from "./bookmarkLinks";

import { BookMarkedIcon } from "lucide-react";

import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";
import { cn } from "@/lib/utils";

interface OpenBookmarkPageButtonProps {
  linkable: BookmarkLinkable;
  className?: string;
}

// A small secondary affordance that opens the bookmark's Simple Bookmarks page.
// Shown only when the primary click goes somewhere else (clickTarget "page") and
// an endpoint is configured, so it never duplicates the title link and stays
// hidden entirely when no app URL is known.
export function OpenBookmarkPageButton({
  linkable,
  className,
}: OpenBookmarkPageButtonProps) {
  const {
    clickTarget, bookmarkPageUrl,
  } = useBookmarkLinking();

  if (clickTarget !== "page") {
    return null;
  }

  const href = bookmarkPageUrl(linkable);
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Open bookmark page"
      title="Open bookmark page"
      className={cn(
        `
          inline-flex text-muted-foreground
          hover:text-foreground
        `,
        className,
      )}
    >
      <BookMarkedIcon className="size-3" />
    </a>
  );
}
