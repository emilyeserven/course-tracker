import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { TopicList } from "@/components/boxElements/TopicList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CourseInteractionsLog } from "@/components/courses/CourseInteractionsLog";
import { CourseModulesAdmin } from "@/components/courses/CourseModulesAdmin";
import { InfoArea } from "@/components/layout/InfoArea";
import { InfoRow } from "@/components/layout/InfoRow";
import { Button } from "@/components/ui/button";
import { fetchRoutines, fetchSingleResource, makePercentageComplete } from "@/utils";

export interface CourseSearch {
  promptDaily?: 1;
}

export const Route = createFileRoute("/resources/$id/")({
  component: SingleCourse,
  validateSearch: (search: Record<string, unknown>): CourseSearch => ({
    promptDaily:
      search.promptDaily === 1 || search.promptDaily === "1" ? 1 : undefined,
  }),
});

function SingleCourse() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [dailyPromptOpen, setDailyPromptOpen] = useState<boolean>(
    search.promptDaily === 1,
  );

  const {
    data,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchSingleResource(id),
  });

  const {
    data: routines,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: () => fetchRoutines(),
  });

  const percentComplete = makePercentageComplete(
    data?.progressCurrent,
    data?.progressTotal,
  );

  const topics = data?.topics ?? null;

  // A resource → routine link is either a weekly-grid entry or a connection.
  const linkedRoutines = (routines ?? []).filter(r =>
    Object.values(r.weekly ?? {}).some(
      e => e?.type === "resource" && e.id === id,
    )
    || (r.connections ?? []).some(c => c.type === "resource" && c.id === id));

  return (
    <div className="container flex-col gap-12">
      <InfoArea
        header="Routines"
        condition={true}
      >
        <div className="flex flex-col gap-3">
          {linkedRoutines.length === 0 && (
            <span className="text-sm text-muted-foreground">
              No routines include this resource yet.
            </span>
          )}
          {linkedRoutines.map(r => (
            <div
              key={r.id}
              className="
                flex flex-row items-center justify-between gap-2 rounded-md
                border bg-card p-3
              "
            >
              <Link
                to="/routines/$id"
                params={{
                  id: r.id,
                }}
                className="
                  font-medium
                  hover:text-blue-600
                "
              >
                {r.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {r.mode === "daily" ? "Daily" : "Weekly"}
              </span>
            </div>
          ))}
          <div>
            <Link
              to="/routines/$id/edit"
              params={{
                id: "new",
              }}
              search={{
                mode: "daily",
                entryType: "resource",
                entryId: id,
              }}
            >
              <Button
                variant="outline"
                size="sm"
              >
                <PlusIcon />
                New Routine
              </Button>
            </Link>
          </div>
        </div>
      </InfoArea>
      <InfoArea
        header="About"
        condition={!!data?.description}
      >
        <p>{data?.description}</p>
      </InfoArea>
      <InfoRow header="Basic Info">
        <InfoArea
          header="Provider"
          condition={!!data?.provider}
        >
          {data?.provider && data.provider.name && (
            <Link
              to="/providers/$id"
              from="/resources/$id"
              params={{
                id: data.provider.id + "",
              }}
              className={`
                text-blue-800
                hover:text-blue-600
              `}
            >
              {data?.provider?.name}
            </Link>
          )}
        </InfoArea>
        <InfoArea
          header={`Topic${topics && topics.length > 1 ? "s" : ""}`}
          condition={!!topics}
        >
          <TopicList
            topics={data?.topics}
            isPills={false}
          />
        </InfoArea>
      </InfoRow>
      <InfoRow header="Progress">
        <InfoArea
          header="Current Progress"
          condition={!!data?.progressCurrent}
        >
          <p>{data?.progressCurrent}</p>
        </InfoArea>
        <InfoArea
          header="Total Modules"
          condition={!!data?.progressTotal}
        >
          <p>{data?.progressTotal}</p>
        </InfoArea>
        <InfoArea
          header="% Complete"
          condition={!!data?.progressTotal && !!data?.progressCurrent}
        >
          <p>{percentComplete}%</p>
        </InfoArea>
        {!data?.progressCurrent && !data?.progressTotal && (
          <span>No progress information given.</span>
        )}
      </InfoRow>
      <InfoRow
        header="Effort & Engagement"
        condition={
          !!data?.easeOfStarting || !!data?.timeNeeded || !!data?.interactivity
        }
      >
        <InfoArea
          header="Ease of Starting"
          condition={!!data?.easeOfStarting}
        >
          <p className="capitalize">{data?.easeOfStarting}</p>
        </InfoArea>
        <InfoArea
          header="Time Needed"
          condition={!!data?.timeNeeded}
        >
          <p className="capitalize">{data?.timeNeeded}</p>
        </InfoArea>
        <InfoArea
          header="Interactivity"
          condition={!!data?.interactivity}
        >
          <p className="capitalize">{data?.interactivity}</p>
        </InfoArea>
      </InfoRow>
      <CourseModulesAdmin
        resourceId={id}
        modulesAreExhaustive={data?.modulesAreExhaustive}
      />
      <CourseInteractionsLog resourceId={id} />
      <InfoRow
        condition={data?.cost?.cost != null}
        header="Money Things"
      >
        <div className="flex flex-row gap-1">
          <InfoArea
            header="Resource Cost"
            condition={!percentComplete}
          >
            <p>{data?.cost.cost}</p>
          </InfoArea>
          <InfoArea
            header="Cost per Unit"
            condition={!!percentComplete}
          >
            <p>
              <span>
                $
                {Number(
                  Number(data?.cost.cost) / Number(percentComplete),
                ).toFixed(2)}{" "}
                out of ${data?.cost.cost}
              </span>
            </p>
          </InfoArea>
        </div>
      </InfoRow>
      <ConfirmDialog
        open={dailyPromptOpen}
        title="Create a Routine for this resource?"
        description="You marked this resource as active. Want to create a daily Routine that tracks your progress on it?"
        cancelLabel="No thanks"
        confirmLabel="Create Routine"
        onCancel={async () => {
          setDailyPromptOpen(false);
          await navigate({
            to: "/resources/$id",
            params: {
              id,
            },
            search: {},
            replace: true,
          });
        }}
        onConfirm={async () => {
          setDailyPromptOpen(false);
          await navigate({
            to: "/routines/$id/edit",
            params: {
              id: "new",
            },
            search: {
              mode: "daily",
              entryType: "resource",
              entryId: id,
            },
          });
        }}
      />
    </div>
  );
}
