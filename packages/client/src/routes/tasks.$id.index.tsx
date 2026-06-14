import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";

import { LinkedRoutinesSection } from "./tasks.$id.-components/-LinkedRoutinesSection";
import { ResourcesTable } from "./tasks.$id.-components/-ResourcesTable";
import { TodosChecklist } from "./tasks.$id.-components/-TodosChecklist";

import { InfoArea, PageHeader } from "@/components/layout";
import { EntityError, EntityPending } from "@/components/listControls/EntityStates";
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
  const linkedRoutines = (routines ?? []).filter(r =>
    Object.values(r.weekly ?? {}).some(
      e => e?.type === "task" && e.id === id,
    )
    || (r.connections ?? []).some(c => c.type === "task" && c.id === id));

  return (
    <div>
      <PageHeader
        pageTitle={data.name}
        pageSection="tasks"
      >
        <div className="flex flex-row flex-wrap gap-2">
          <Link
            to="/tasks/$id/edit"
            params={{
              id: data.id,
            }}
          >
            <Button variant="secondary">
              Edit Task
              {" "}
              <EditIcon />
            </Button>
          </Link>
        </div>
      </PageHeader>
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
          header="Description"
          condition={!!data.description}
        >
          <p>{data.description}</p>
        </InfoArea>
        <InfoArea
          header="ToDo's"
          condition={true}
        >
          <TodosChecklist task={data} />
        </InfoArea>
        <InfoArea
          header="Resources"
          condition={true}
        >
          <ResourcesTable task={data} />
        </InfoArea>
      </div>
    </div>
  );
}
