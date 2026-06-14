import type { TaskDisplay } from "./-TodoistTaskList";
import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type { TodoistTasks } from "@emstack/types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { TodoistTaskList } from "./-TodoistTaskList";
import {
  Button,
  DashboardIntegrationCard,
  queryKeys,
  SettingsLink,
  SettingToggle,
} from "../shared/-cardKit";

import { closeTodoistTask, fetchTodoistTasks } from "@/utils";

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
          <TodoistTaskList
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
          <TodoistTaskList
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
