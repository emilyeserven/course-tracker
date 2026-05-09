import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, ExternalLinkIcon } from "lucide-react";

import { DailyRecentDaysStrip } from "@/components/dailies";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResourcesTable } from "@/components/tasks/ResourcesTable";
import { TodosChecklist } from "@/components/tasks/TodosChecklist";
import { Button } from "@/components/ui/button";
import { fetchSingleTask } from "@/utils";

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

  if (isPending) {
    return <TaskPending />;
  }

  if (error || !data) {
    return <TaskError />;
  }

  const linkedDaily = data.daily;
  const dailyForStrip = linkedDaily
    ? {
      id: linkedDaily.id,
      name: linkedDaily.name,
      completions: linkedDaily.completions ?? [],
      status: linkedDaily.status ?? "active",
    }
    : null;

  return (
    <div>
      <PageHeader
        pageTitle={data.name}
        pageSection="tasks"
      >
        <div className="flex flex-row flex-wrap gap-2">
          {linkedDaily && (
            <Link
              to="/dailies/$id"
              params={{
                id: linkedDaily.id,
              }}
            >
              <Button variant="outline">
                Open Daily:
                {" "}
                {linkedDaily.name}
                {linkedDaily.status === "complete" ? " (completed)" : ""}
                {" "}
                <ExternalLinkIcon />
              </Button>
            </Link>
          )}
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
        {dailyForStrip && (
          <InfoArea
            header="Last 14 Days"
            condition={true}
          >
            <DailyRecentDaysStrip
              daily={dailyForStrip}
              count={14}
              labelFormat="mmdd"
            />
          </InfoArea>
        )}
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
