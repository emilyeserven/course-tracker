import type { TaskTodo } from "@emstack/types";

import { ExternalLinkIcon, PencilIcon } from "lucide-react";

import { OpenBookmarkPageButton } from "@/components/bookmarks";
import { DailyStatusCircle } from "@/components/dailies/DailyStatusCircle";
import { getDailyStatusOption } from "@/components/dailies/dailyStatusMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";

interface TodoReadRowProps {
  todo: TaskTodo;
  // Blocks the row's actions while a save is in flight or another row edits.
  actionsDisabled: boolean;
  onToggleStatus: () => void;
  onStartEdit: () => void;
}

// A todo's read-mode list row: status toggle, name, due-date badge, bookmark
// chips, and the hover-revealed link/edit actions. The edit-mode counterpart
// is TodoEditRow.
export function TodoReadRow({
  todo,
  actionsDisabled,
  onToggleStatus,
  onStartEdit,
}: TodoReadRowProps) {
  const {
    resolveHref,
  } = useBookmarkLinking();
  const statusOption = getDailyStatusOption(todo.status);

  return (
    <li
      className="
        group flex flex-col gap-1 p-3
        hover:bg-muted/40
      "
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleStatus}
          disabled={actionsDisabled}
          aria-label={`Status: ${statusOption.label}. Toggle.`}
          title={statusOption.label}
        >
          <DailyStatusCircle
            status={todo.status}
            size="sm"
          />
        </button>
        <span className="text-sm font-medium">{todo.name}</span>
        {todo.dueDate && (
          <Badge
            variant="outline"
            className="bg-muted/40"
          >
            due {todo.dueDate}
          </Badge>
        )}
        {(todo.bookmarks ?? []).map((b) => {
          const linkable = {
            externalId: b.bookmarkId,
            url: b.url,
          };
          const href = resolveHref(linkable);
          return (
            <Badge
              key={b.bookmarkId}
              variant="outline"
              className="
                border-amber-200 bg-amber-50 text-amber-900
                dark:border-amber-900/50 dark:bg-amber-950/40
                dark:text-amber-200
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
                  b.title
                )}
              <OpenBookmarkPageButton
                linkable={linkable}
                className="ml-1"
              />
              {b.sectionLabel && (
                <span className="ml-1 opacity-70">
                  › {b.sectionLabel}
                </span>
              )}
            </Badge>
          );
        })}
        <div
          className="
            ml-auto flex items-center gap-1 opacity-0 transition
            group-hover:opacity-100
            focus-within:opacity-100
          "
        >
          {todo.url && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              asChild
              title={todo.url}
            >
              <a
                href={todo.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open link for ${todo.name}`}
              >
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onStartEdit}
            disabled={actionsDisabled}
            aria-label={`Edit ${todo.name}`}
          >
            <PencilIcon className="size-3.5" />
          </Button>
        </div>
      </div>
      {todo.note && (
        <p className="pl-6 text-sm text-muted-foreground">
          {todo.note}
        </p>
      )}
    </li>
  );
}
