import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";

import {
  LinkedRoutinesSection,
  TaskBookmarksList,
  TodosEditor,
} from "./-components";

import {
  InfoArea,
  PageActions,
  PageContainer,
  PageHeader,
} from "@/components/layout";
import {
  EntityError,
  EntityPending,
} from "@/components/listControls/EntityStates";
import { Button } from "@/components/ui/button";
import { fetchRoutines, fetchSingleTask, queryKeys } from "@/utils";

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
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => fetchSingleTask(id),
  });

  const {
    data: routines,
  } = useQuery({
    queryKey: queryKeys.routines.list(),
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
      <PageContainer className="flex flex-col gap-12">
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
          <TaskBookmarksList bookmarks={data.bookmarks ?? []} />
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
      </PageContainer>
    </div>
  );
}
