import type { DashboardLayoutTile, TodoistTask } from "@emstack/types";

import { Check, ExternalLink, Repeat } from "lucide-react";

// Todoist priority is 1–4 with 4 the most urgent (shown as "P1" in the app).
// Only the two highest priorities get a coloured dot; the rest stay muted.
function priorityDotClass(priority: number): string {
  if (priority >= 4) return "bg-red-500";
  if (priority === 3) return "bg-orange-500";
  return "bg-muted-foreground/40";
}

export type TaskDisplay = Required<
  Pick<DashboardLayoutTile, "showProject" | "showLabels" | "showDescription">
>;

export function TodoistTaskList({
  tasks,
  overdue,
  display,
  onComplete,
  completingId,
}: {
  tasks: TodoistTask[];
  overdue: boolean;
  display: TaskDisplay;
  onComplete: (id: string) => void;
  completingId: string | null;
}) {
  return (
    <ul className="flex flex-col divide-y">
      {tasks.map((task) => {
        const meta = [
          display.showProject ? task.project : null,
          ...(display.showLabels ? task.labels.map(l => `@${l}`) : []),
        ].filter((part): part is string => Boolean(part));
        return (
          <li
            key={task.id}
            className="flex flex-row items-start gap-2 py-2"
          >
            <span
              aria-hidden
              className={`
                mt-1.5 size-2 shrink-0 rounded-full
                ${priorityDotClass(task.priority)}
              `}
            />
            <button
              type="button"
              role="checkbox"
              aria-checked={false}
              aria-label="Complete task"
              disabled={completingId === task.id}
              onClick={() => onComplete(task.id)}
              className="
                mt-0.5 flex size-4 shrink-0 items-center justify-center
                rounded-full border border-muted-foreground/50 text-transparent
                hover:border-foreground hover:text-foreground
                disabled:opacity-50
              "
            >
              <Check className="size-3" />
            </button>
            <div className="flex min-w-0 flex-col gap-0.5">
              <a
                href={task.url}
                target="_blank"
                rel="noreferrer"
                className="
                  truncate text-sm font-medium
                  hover:text-blue-600
                "
              >
                {task.content}
              </a>
              {display.showDescription && task.description && (
                <span className="truncate text-xs text-muted-foreground">
                  {task.description}
                </span>
              )}
              {meta.length > 0 && (
                <span
                  className="
                    flex flex-wrap items-center gap-1 text-xs
                    text-muted-foreground
                  "
                >
                  {meta.map(part => (
                    <span
                      key={part}
                      className="rounded-sm bg-muted px-1 py-0.5"
                    >
                      {part}
                    </span>
                  ))}
                </span>
              )}
              {task.due && (
                <span
                  className={`
                    flex items-center gap-1 truncate text-xs
                    ${
                overdue ? "text-destructive" : "text-muted-foreground"
                }
                  `}
                >
                  {task.due}
                  {task.isRecurring && <Repeat className="size-3" />}
                </span>
              )}
            </div>
            <a
              href={task.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Open task in Todoist"
              className="
                mt-0.5 ml-auto text-muted-foreground
                hover:text-foreground
              "
            >
              <ExternalLink className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
