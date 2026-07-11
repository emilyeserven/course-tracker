import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, ExternalLinkIcon } from "lucide-react";

import { LinkedRoutinesSection } from "./-components/-LinkedRoutinesSection";
import { TodosEditor } from "./-components/-TodosEditor";

import { InfoArea, PageActions, PageHeader } from "@/components/layout";
import {
  EntityError,
  EntityPending,
} from "@/components/listControls/EntityStates";
import { Button } from "@/components/ui/button";
import { fetchRoutines, fetchSingleTask } from "@/utils";

export const Route = createFileRoute("/tasks/$id/")({
  component: SingleTask,
});

function TaskPending() {
  return <EntityPending entity="task" />;
}

function TaskError() {
  return <EntityError entity="task" />;
}

function SingleTask() {
  const {
    id,
  } = Route.useParams();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchSingleTask(id),
  });

  const {
    data: routines,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: () => fetchRoutines(),
  });

  if (isPending) {
    return <TaskPending />;
  }

  if (error || !data) {
    return <TaskError />;
  }

  // A task → routine link is either a weekly-grid entry or a connection.
  const linkedRoutines = (routines ?? []).filter(
    r =>
      Object.values(r.weekly ?? {}).some(
        e => e?.type === "task" && e.id === id,
      ) || (r.connections ?? []).some(c => c.type === "task" && c.id === id),
  );

  return (
    <div>
      <PageActions>
        <Link
          to="/tasks/$id/edit"
          params={{
            id: data.id,
          }}
        >
          <Button variant="secondary">
            Edit Task List
            {" "}
            <EditIcon />
          </Button>
        </Link>
      </PageActions>
      <PageHeader
        pageTitle={data.name}
        pageSection="tasks"
      />
      <div className="container flex flex-col gap-12">
        <InfoArea
          header="Routines"
          condition={true}
        >
          <LinkedRoutinesSection
            routines={linkedRoutines}
            taskId={data.id}
          />
        </InfoArea>
        <InfoArea
          header="Topic"
          condition={!!data.topic}
        >
          <Link
            to="/topics/$id"
            params={{
              id: data.topic?.id ?? "",
            }}
            className={`
              font-bold text-blue-800
              hover:text-blue-600
              dark:text-blue-300
            `}
          >
            {data.topic?.name}
          </Link>
        </InfoArea>
        <InfoArea
          header="Bookmarks"
          condition={(data.bookmarks ?? []).length > 0}
        >
          <ul className="flex flex-wrap gap-2">
            {(data.bookmarks ?? []).map(b => (
              <li
                key={b.bookmarkId}
                className="
                  flex items-center gap-1.5 rounded-md border border-border
                  bg-muted px-2 py-1 text-sm
                "
              >
                {b.url
                  ? (
                    <a
                      href={b.url}
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
              </li>
            ))}
          </ul>
        </InfoArea>
        <InfoArea
          header="Due Date"
          condition={!!data.dueDate}
        >
          <p>{data.dueDate}</p>
        </InfoArea>
        <InfoArea
          header="Description"
          condition={!!data.description}
        >
          <p>{data.description}</p>
        </InfoArea>
        <InfoArea
          header="To-Do's"
          condition={true}
        >
          <TodosEditor task={data} />
        </InfoArea>
      </div>
    </div>
  );
}
