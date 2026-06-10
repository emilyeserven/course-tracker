import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { TopicList } from "@/components/boxElements/TopicList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CourseInteractionsLog } from "@/components/courses/CourseInteractionsLog";
import { CourseModulesAdmin } from "@/components/courses/CourseModulesAdmin";
import { DailyEditDialog, DailySection } from "@/components/dailies";
import { InfoArea } from "@/components/layout/InfoArea";
import { InfoRow } from "@/components/layout/InfoRow";
import { Button } from "@/components/ui/button";
import { fetchSingleResource, makePercentageComplete } from "@/utils";

interface CourseSearch {
  promptDaily?: 1;
  dailySection?: string;
  dailyMode?: "view" | "edit";
}

export const Route = createFileRoute("/resources/$id/")({
  component: SingleCourse,
  validateSearch: (search: Record<string, unknown>): CourseSearch => ({
    promptDaily:
      search.promptDaily === 1 || search.promptDaily === "1" ? 1 : undefined,
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

function SingleCourse() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [dailyPromptOpen, setDailyPromptOpen] = useState<boolean>(
    search.promptDaily === 1,
  );
  const [createDailyOpen, setCreateDailyOpen] = useState(false);
  // Track which daily section was auto-targeted by search params so we only
  // surface the auto-open hint to the matching DailySection.
  const [autoOpenedFor, setAutoOpenedFor] = useState<string | null>(
    search.dailySection ?? null,
  );

  useEffect(() => {
    setAutoOpenedFor(search.dailySection ?? null);
  }, [search.dailySection]);

  const {
    data,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchSingleResource(id),
  });

  const percentComplete = makePercentageComplete(
    data?.progressCurrent,
    data?.progressTotal,
  );

  const topics = data?.topics ?? null;
  const dailies = data?.dailies ?? [];

  const clearDailySearch = () => {
    void navigate({
      to: "/resources/$id",
      params: {
        id,
      },
      search: {
        promptDaily: search.promptDaily,
      },
      replace: true,
    });
  };

  return (
    <div className="container flex-col gap-12">
      <InfoArea
        header={`Dail${dailies.length === 1 ? "y" : "ies"}`}
        condition={true}
      >
        <div className="flex flex-col gap-3">
          {dailies.length === 0 && (
            <span className="text-sm text-muted-foreground">
              No dailies linked to this resource yet.
            </span>
          )}
          {dailies.map(daily => (
            <DailySection
              key={daily.id}
              daily={{
                id: daily.id,
                name: daily.name,
                location: daily.location ?? null,
                status: daily.status ?? "active",
              }}
              lockedResourceId={id}
              autoOpenMode={
                autoOpenedFor === daily.id ? search.dailyMode : null
              }
              onAutoOpenConsumed={clearDailySearch}
            />
          ))}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateDailyOpen(true)}
            >
              <PlusIcon />
              New Daily
            </Button>
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
        title="Create a Daily for this resource?"
        description="You marked this resource as active. Want to create a Daily that tracks your progress on it?"
        cancelLabel="No thanks"
        confirmLabel="Create Daily"
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
            to: "/resources/$id",
            params: {
              id,
            },
            search: {},
            replace: true,
          });
          setCreateDailyOpen(true);
        }}
      />
      <DailyEditDialog
        open={createDailyOpen}
        onOpenChange={setCreateDailyOpen}
        id="new"
        isNew
        lockedResourceId={id}
      />
    </div>
  );
}
