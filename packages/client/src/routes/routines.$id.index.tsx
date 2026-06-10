import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";

import { DailyDetailsPanel } from "@/components/dailies/DailyDetailsPanel";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DAY_LABELS,
  DAY_ORDER,
} from "@/components/routines/weekly";
import { Button } from "@/components/ui/button";
import { fetchResources, fetchSingleRoutine, fetchTasks } from "@/utils";

export const Route = createFileRoute("/routines/$id/")({
  component: SingleRoutine,
});

function RoutinePending() {
  return <EntityPending entity="routine" />;
}

function RoutineError() {
  return <EntityError entity="routine" />;
}

function SingleRoutine() {
  const {
    id,
  } = Route.useParams();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["routine", id],
    queryFn: () => fetchSingleRoutine(id),
  });

  const {
    data: tasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const {
    data: resources,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchResources(),
  });

  const taskNames = useMemo(
    () => new Map((tasks ?? []).map(t => [t.id, t.name])),
    [tasks],
  );
  const resourceNames = useMemo(
    () => new Map((resources ?? []).map(r => [r.id, r.name])),
    [resources],
  );

  if (isPending) {
    return <RoutinePending />;
  }

  if (error || !data) {
    return <RoutineError />;
  }

  const weekly = data.weekly ?? {};
  const isDaily = data.mode === "daily";
  const dailyEntry = isDaily
    ? Object.values(weekly).find(Boolean) ?? null
    : null;

  function renderEntryLink(entry: { type: string;
    id: string; }) {
    if (entry.type === "freeform") {
      return (
        <span className="text-sm">
          <span className="mr-2 text-xs text-muted-foreground uppercase">
            freeform
          </span>
          {entry.id}
        </span>
      );
    }
    return (
      <Link
        to={entry.type === "task" ? "/tasks/$id" : "/resources/$id"}
        params={{
          id: entry.id,
        }}
        className="
          text-blue-800
          hover:text-blue-600
          dark:text-blue-300
        "
      >
        <span className="mr-2 text-xs text-muted-foreground uppercase">
          {entry.type}
        </span>
        {entry.type === "task"
          ? (taskNames.get(entry.id) ?? entry.id)
          : (resourceNames.get(entry.id) ?? entry.id)}
      </Link>
    );
  }

  return (
    <div>
      <PageHeader
        pageTitle={data.name}
        pageSection="routines"
      >
        <Link
          to="/routines/$id/edit"
          params={{
            id: data.id,
          }}
        >
          <Button variant="secondary">
            Edit Routine
            {" "}
            <EditIcon />
          </Button>
        </Link>
      </PageHeader>
      <div className="container flex flex-col gap-12">
        <InfoArea
          header="Type"
          condition={true}
        >
          <span
            className="
              inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs
              font-medium
            "
          >
            {isDaily ? "Daily Task" : "Weekly Schedule"}
          </span>
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
          header="Status"
          condition={true}
        >
          <span className="capitalize">{data.status ?? "active"}</span>
        </InfoArea>
        {isDaily
          ? (
            <InfoArea
              header="Daily Task"
              condition={!!dailyEntry}
            >
              {dailyEntry && renderEntryLink(dailyEntry)}
            </InfoArea>
          )
          : (
            <InfoArea
              header="Weekly Schedule"
              condition={true}
            >
              <ul className="flex flex-col gap-1">
                {DAY_ORDER.map((day) => {
                  const entry = weekly[day];
                  return (
                    <li
                      key={day}
                      className="
                        grid grid-cols-[120px_1fr] items-center gap-2 border-b
                        border-border/60 py-1
                      "
                    >
                      <span className="text-sm font-medium">
                        {DAY_LABELS[day]}
                      </span>
                      {entry
                        ? renderEntryLink(entry)
                        : (
                          <span
                            className="text-sm text-muted-foreground italic"
                          >
                            Nothing scheduled
                          </span>
                        )}
                    </li>
                  );
                })}
              </ul>
            </InfoArea>
          )}
        <DailyDetailsPanel dailyId={id} />
      </div>
    </div>
  );
}
