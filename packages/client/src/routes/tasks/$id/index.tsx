import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, ExternalLinkIcon } from "lucide-react";

import { LinkedRoutinesSection } from "./-components/-LinkedRoutinesSection";
import { TodosEditor } from "./-components/-TodosEditor";

import { OpenBookmarkPageButton } from "@/components/bookmarks";
import { InfoArea, PageActions, PageHeader } from "@/components/layout";
import {
  EntityError,
  EntityPending,
} from "@/components/listControls/EntityStates";
import { Button } from "@/components/ui/button";
import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";
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

  const {
    resolveHref,
  } = useBookmarkLinking();

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
          header="Bookmarks"
          condition={(data.bookmarks ?? []).length > 0}
        >
          <ul className="flex flex-wrap gap-2">
            {(data.bookmarks ?? []).map((b) => {
              const linkable = {
                externalId: b.bookmarkId,
                url: b.url,
              };
              const href = resolveHref(linkable);
              return (
                <li
                  key={b.bookmarkId}
                  className="
                    flex items-center gap-1.5 rounded-md border border-border
                    bg-muted px-2 py-1 text-sm
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
