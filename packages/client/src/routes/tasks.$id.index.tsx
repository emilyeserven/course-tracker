import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, ExternalLinkIcon } from "lucide-react";

import { DailyRecentDaysStrip } from "@/components/dailies";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResourcesTable } from "@/components/tasks/ResourcesTable";
import { Button } from "@/components/ui/button";
import { fetchSingleTask } from "@/utils";

export const Route = createFileRoute("/tasks/$id/")({
  component: SingleTask,
});

function TaskPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your task...</h1>
    </div>
  );
}

function TaskError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading this task.</h1>
    </div>
  );
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
        <div className="flex flex-row gap-2">
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
        {dailyForStrip && linkedDaily && (
          <InfoArea
            header="Last 14 Days"
            condition={true}
          >
            <div className="flex flex-col gap-2">
              <DailyRecentDaysStrip
                daily={dailyForStrip}
                count={14}
                labelFormat="mmdd"
              />
              <Link
                to="/dailies/$id"
                params={{
                  id: linkedDaily.id,
                }}
                className="
                  inline-flex w-fit items-center gap-1 text-xs text-blue-700
                  hover:text-blue-500
                  dark:text-blue-300
                "
              >
                Open Daily:
                {" "}
                {linkedDaily.name}
                {linkedDaily.status === "complete" ? " (completed)" : ""}
                <ExternalLinkIcon className="size-3.5" />
              </Link>
            </div>
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
          header="Resources"
          condition={true}
        >
          <ResourcesTable task={data} />
        </InfoArea>
      </div>
    </div>
  );
}
