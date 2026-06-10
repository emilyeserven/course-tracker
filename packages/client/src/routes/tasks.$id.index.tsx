import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon, PlusIcon } from "lucide-react";

import { DailyEditDialog, DailySection } from "@/components/dailies";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResourcesTable } from "@/components/tasks/ResourcesTable";
import { TodosChecklist } from "@/components/tasks/TodosChecklist";
import { Button } from "@/components/ui/button";
import { fetchSingleTask } from "@/utils";

interface TaskSearch {
  dailySection?: string;
  dailyMode?: "view" | "edit";
}

export const Route = createFileRoute("/tasks/$id/")({
  component: SingleTask,
  validateSearch: (search: Record<string, unknown>): TaskSearch => ({
    dailySection:
      typeof search.dailySection === "string" && search.dailySection
        ? search.dailySection
        : undefined,
    dailyMode:
      search.dailyMode === "view" || search.dailyMode === "edit"
        ? search.dailyMode
        : undefined,
  }),
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
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [createDailyOpen, setCreateDailyOpen] = useState(false);

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

  const clearDailySearch = () => {
    void navigate({
      to: "/tasks/$id",
      params: {
        id,
      },
      search: {},
      replace: true,
    });
  };

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
          header="Daily"
          condition={true}
        >
          {linkedDaily
            ? (
              <DailySection
                daily={{
                  id: linkedDaily.id,
                  name: linkedDaily.name,
                  status: linkedDaily.status ?? "active",
                }}
                lockedTaskId={data.id}
                autoOpenMode={search.dailyMode}
                onAutoOpenConsumed={clearDailySearch}
              />
            )
            : (
              <div
                className="
                  flex flex-row items-center justify-between gap-2 rounded-md
                  border border-dashed bg-card p-4
                "
              >
                <span className="text-sm text-muted-foreground">
                  No daily tracker linked to this task.
                </span>
                <Button onClick={() => setCreateDailyOpen(true)}>
                  <PlusIcon />
                  Create Daily for this Task
                </Button>
              </div>
            )}
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
      <DailyEditDialog
        open={createDailyOpen}
        onOpenChange={setCreateDailyOpen}
        id="new"
        isNew
        lockedTaskId={data.id}
      />
    </div>
  );
}
