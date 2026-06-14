import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type { DashboardLayoutTile, TodoistTask, TodoistTasks } from "@emstack/types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, Repeat } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  DashboardIntegrationCard,
  queryKeys,
  SettingsLink,
  SettingToggle,
} from "./-cardKit";

import { closeTodoistTask, fetchTodoistTasks } from "@/utils";

// Todoist priority is 1–4 with 4 the most urgent (shown as "P1" in the app).
// Only the two highest priorities get a coloured dot; the rest stay muted.
function priorityDotClass(priority: number): string {
  if (priority >= 4) return "bg-red-500";
  if (priority === 3) return "bg-orange-500";
  return "bg-muted-foreground/40";
}

// Resolved per-tile display flags (defaults applied) — the persisted versions
// on DashboardLayoutTile are optional; readers below require them.
type TaskDisplay = Required<
  Pick<DashboardLayoutTile, "showProject" | "showLabels" | "showDescription">
>;

function TaskList({
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

export function DashboardTodoist({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const queryClient = useQueryClient();
  const {
    data, isPending, error,
  } = useQuery({
    queryKey: queryKeys.todoist.tasks(),
    queryFn: () => fetchTodoistTasks(),
    staleTime: 5 * 60 * 1000,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => closeTodoistTask(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.todoist.tasks(),
      });
      const previous = queryClient.getQueryData<TodoistTasks>(
        queryKeys.todoist.tasks(),
      );
      queryClient.setQueryData<TodoistTasks>(
        queryKeys.todoist.tasks(),
        old =>
          old
            ? {
              ...old,
              overdue: old.overdue.filter(t => t.id !== id),
              today: old.today.filter(t => t.id !== id),
            }
            : old,
      );
      return {
        previous,
      };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.todoist.tasks(), context.previous);
      }
      toast.error(err instanceof Error ? err.message : "Failed to complete task");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.todoist.tasks(),
      });
    },
  });

  const configured = data?.configured ?? false;
  const overdue = data?.overdue ?? [];
  const today = data?.today ?? [];

  // Display toggles default on, except descriptions (often long) which default off.
  const showOverdue = tile.showOverdue !== false;
  const display: TaskDisplay = {
    showProject: tile.showProject !== false,
    showLabels: tile.showLabels !== false,
    showDescription: tile.showDescription === true,
  };
  const completingId = completeMutation.isPending
    ? completeMutation.variables
    : null;

  return (
    <DashboardIntegrationCard
      tile={tile}
      onUpdateTile={onUpdateTile}
      title="Todoist"
      action={(
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
      )}
      settingsExtra={(
        <div className="flex flex-col gap-2 border-t pt-3">
          <SettingToggle
            label="Show project"
            checked={display.showProject}
            onChange={showProject => onUpdateTile({
              showProject,
            })}
          />
          <SettingToggle
            label="Show tags"
            checked={display.showLabels}
            onChange={showLabels => onUpdateTile({
              showLabels,
            })}
          />
          <SettingToggle
            label="Show descriptions"
            checked={display.showDescription}
            onChange={showDescription => onUpdateTile({
              showDescription,
            })}
          />
          <SettingToggle
            label="Show overdue"
            checked={showOverdue}
            onChange={value => onUpdateTile({
              showOverdue: value,
            })}
          />
        </div>
      )}
      settingsLink={(
        <SettingsLink className="text-sm">Set Todoist API key</SettingsLink>
      )}
      configured={configured}
      isPending={isPending}
      error={error}
      connectPrompt={(
        <p className="text-sm text-muted-foreground">
          Add your Todoist API key in
          {" "}
          <SettingsLink>Settings</SettingsLink>
          {" "}
          to see tasks due today and overdue.
        </p>
      )}
      isEmpty={configured && overdue.length === 0 && today.length === 0}
      entity="tasks"
      emptyMessage="Nothing due today. 🎉"
    >
      {showOverdue && overdue.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3
            className="
              text-xs font-semibold tracking-wide text-destructive uppercase
            "
          >
            Overdue (
            {overdue.length}
            )
          </h3>
          <TaskList
            tasks={overdue}
            overdue
            display={display}
            onComplete={id => completeMutation.mutate(id)}
            completingId={completingId}
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
            display={display}
            onComplete={id => completeMutation.mutate(id)}
            completingId={completingId}
          />
        </div>
      )}
    </DashboardIntegrationCard>
  );
}
