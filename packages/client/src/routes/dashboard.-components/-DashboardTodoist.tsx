import type { TodoistTask } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Repeat } from "lucide-react";

import {
  DashboardCard,
  DashboardSectionStatus,
} from "@/components/boxes/DashboardCard";
import { Button } from "@/components/ui/button";
import { fetchTodoistTasks } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

// Todoist priority is 1–4 with 4 the most urgent (shown as "P1" in the app).
// Only the two highest priorities get a coloured dot; the rest stay muted.
function priorityDotClass(priority: number): string {
  if (priority >= 4) return "bg-red-500";
  if (priority === 3) return "bg-orange-500";
  return "bg-muted-foreground/40";
}

function TaskList({
  tasks,
  overdue,
}: {
  tasks: TodoistTask[];
  overdue: boolean;
}) {
  return (
    <ul className="flex flex-col divide-y">
      {tasks.map(task => (
        <li
          key={task.id}
          className="flex flex-row items-center gap-2 py-2"
        >
          <span
            aria-hidden
            className={`
              size-2 shrink-0 rounded-full
              ${priorityDotClass(task.priority)}
            `}
          />
          <div className="flex min-w-0 flex-col">
            <a
              href={task.url}
              target="_blank"
              rel="noreferrer"
              className="
                truncate font-medium
                hover:text-blue-600
              "
            >
              {task.content}
            </a>
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
              ml-auto text-muted-foreground
              hover:text-foreground
            "
          >
            <ExternalLink className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function DashboardTodoist() {
  const {
    data, isPending, error,
  } = useQuery({
    queryKey: queryKeys.todoist.tasks(),
    queryFn: () => fetchTodoistTasks(),
    staleTime: 5 * 60 * 1000,
  });

  const configured = data?.configured ?? false;
  const overdue = data?.overdue ?? [];
  const today = data?.today ?? [];

  return (
    <DashboardCard
      title="Todoist"
      action={(
        <>
          <Button
            asChild
            size="sm"
            variant="outline"
          >
            <a
              href="https://app.todoist.com/app/today"
              target="_blank"
              rel="noreferrer"
            >
              Open Todoist
              <ExternalLink />
            </a>
          </Button>
          <Link
            to="/settings"
            search={{
              tab: "connections",
            }}
            className="
              text-sm text-primary underline-offset-2
              hover:underline
            "
          >
            Settings
          </Link>
        </>
      )}
    >
      {!isPending && !error && !configured
        ? (
          <p className="text-sm text-muted-foreground">
            Add your Todoist API key in
            {" "}
            <Link
              to="/settings"
              search={{
                tab: "connections",
              }}
              className="
                text-primary underline-offset-2
                hover:underline
              "
            >
              Settings
            </Link>
            {" "}
            to see tasks due today and overdue.
          </p>
        )
        : (
          <>
            <DashboardSectionStatus
              isPending={isPending}
              error={error}
              isEmpty={configured && overdue.length === 0 && today.length === 0}
              entity="tasks"
              emptyMessage="Nothing due today. 🎉"
            />
            {overdue.length > 0 && (
              <div className="flex flex-col gap-1">
                <h3
                  className="
                    text-xs font-semibold tracking-wide text-destructive
                    uppercase
                  "
                >
                  Overdue (
                  {overdue.length}
                  )
                </h3>
                <TaskList
                  tasks={overdue}
                  overdue
                />
              </div>
            )}
            {today.length > 0 && (
              <div className="flex flex-col gap-1">
                <h3
                  className="
                    text-xs font-semibold tracking-wide text-muted-foreground
                    uppercase
                  "
                >
                  Today
                </h3>
                <TaskList
                  tasks={today}
                  overdue={false}
                />
              </div>
            )}
          </>
        )}
    </DashboardCard>
  );
}
