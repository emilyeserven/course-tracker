import type { Task } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckSquareIcon, PlusIcon } from "lucide-react";

import { ContentBox } from "@/components/boxes/ContentBox";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchTasks } from "@/utils";

export const Route = createFileRoute("/tasks/")({
  component: Tasks,
  errorComponent: TasksError,
  pendingComponent: TasksPending,
});

function TasksPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your tasks...</h1>
    </div>
  );
}

function TasksError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading your tasks.</h1>
    </div>
  );
}

function TaskBox({
  task,
}: { task: Task }) {
  const totalResources = task.resources?.length ?? 0;
  const usedResources
    = task.resources?.filter(r => r.usedYet).length ?? 0;

  return (
    <Link
      to="/tasks/$id"
      params={{
        id: task.id,
      }}
      className="block"
    >
      <ContentBox
        className="
          h-full transition-colors
          hover:bg-accent
        "
      >
        <div className="flex flex-col gap-2 p-4">
          <h3 className="text-xl font-semibold">{task.name}</h3>
          {task.topic && (
            <span className="text-xs text-muted-foreground">
              Topic:
              {" "}
              {task.topic.name}
            </span>
          )}
          {task.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
          <div
            className="
              mt-2 flex flex-row items-center gap-2 text-xs
              text-muted-foreground
            "
          >
            <CheckSquareIcon className="size-4" />
            <span>
              {usedResources}
              {" / "}
              {totalResources}
              {" resources used"}
            </span>
          </div>
        </div>
      </ContentBox>
    </Link>
  );
}

function Tasks() {
  const {
    data,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  return (
    <div>
      <PageHeader
        pageTitle="Tasks"
        pageSection=""
      />
      <div className="container">
        <div className="mb-4 flex justify-end">
          <Link
            to="/tasks/$id/edit"
            params={{
              id: "new",
            }}
          >
            <Button variant="outline">
              <PlusIcon className="size-4" />
              New Task
            </Button>
          </Link>
        </div>
        {(!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">
            <i>No tasks yet!</i>
          </p>
        )}
        {data && data.length > 0 && (
          <div className="card-grid">
            {data.map(task => (
              <TaskBox
                key={task.id}
                task={task}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
