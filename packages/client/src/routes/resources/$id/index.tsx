/* eslint-disable import/max-dependencies */
import type { ResourceModuleProgress } from "@/hooks/useResourceModuleProgress";
import type { GroupProgress, ModuleProgress } from "@/utils/moduleProgress";
import type { Resource } from "@emstack/types";

import { useState } from "react";

import { DEFAULT_MODULE_LABEL } from "@emstack/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { InfinityIcon, PlusIcon } from "lucide-react";

import {
  ModuleGroupBreakdown,
  ResourceInteractionsLog,
  ResourceModulesAdmin,
} from "./-components";

import { TopicList } from "@/components/boxElements";
import { RoutineBox } from "@/components/contentBoxComponents";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { InfoArea, InfoRow, PageTabs } from "@/components/layout";
import { TagChip } from "@/components/tasks/TagChip";
import { Button } from "@/components/ui/button";
import { useResourceModuleProgress } from "@/hooks/useResourceModuleProgress";
import { fetchRoutines, fetchSingleResource, makePercentageComplete } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

const TAB_VALUES = ["details", "modules", "routines", "interactions"] as const;
type ResourceTab = (typeof TAB_VALUES)[number];

export interface CourseSearch {
  promptDaily?: 1;
  tab?: ResourceTab;
}

export const Route = createFileRoute("/resources/$id/")({
  component: SingleCourse,
  validateSearch: (search: Record<string, unknown>): CourseSearch => ({
    promptDaily:
      search.promptDaily === 1 || search.promptDaily === "1" ? 1 : undefined,
    tab:
      typeof search.tab === "string"
      && (TAB_VALUES as readonly string[]).includes(search.tab)
        ? (search.tab as ResourceTab)
        : undefined,
  }),
});

function SingleCourse() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const tab: ResourceTab = search.tab ?? "details";

  const [dailyPromptOpen, setDailyPromptOpen] = useState<boolean>(
    search.promptDaily === 1,
  );

  const {
    data,
  } = useQuery({
    queryKey: queryKeys.resources.detail(id),
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

  // When Module Tracking is on, the Details tab shows progress derived from the
  // modules instead of the manual progressCurrent/progressTotal fields.
  const moduleProgress = useResourceModuleProgress(
    id,
    data?.modulesAreExhaustive ?? false,
  );

  // A resource → routine link is either a weekly-grid entry or a connection.
  const linkedRoutines = (routines ?? []).filter(r =>
    Object.values(r.weekly ?? {}).some(
      e => e?.type === "resource" && e.id === id,
    )
    || (r.connections ?? []).some(c => c.type === "resource" && c.id === id));

  function changeTab(next: ResourceTab) {
    navigate({
      to: "/resources/$id",
      params: {
        id,
      },
      search: prev => ({
        ...prev,
        tab: next,
      }),
      replace: true,
    });
  }

  return (
    <div className="container flex flex-col gap-6">
      <PageTabs
        value={tab}
        onValueChange={changeTab}
        tabs={[
          {
            value: "details",
            label: "Details",
            content: data
              ? (
                <ResourceDetailsTab
                  data={data}
                  percentComplete={percentComplete}
                  moduleProgress={moduleProgress}
                />
              )
              : null,
          },
          {
            value: "modules",
            label: "Modules",
            content: (
              <ResourceModulesAdmin
                resourceId={id}
              />
            ),
          },
          {
            value: "routines",
            label: "Routines",
            content: (
              <div className="flex flex-col gap-3">
                {linkedRoutines.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    No routines include this resource yet.
                  </span>
                )}
                {linkedRoutines.map(r => (
                  <RoutineBox
                    key={r.id}
                    {...r}
                  />
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
            ),
          },
          {
            value: "interactions",
            label: "Interactions",
            content: <ResourceInteractionsLog resourceId={id} />,
          },
        ]}
      />
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

// "Details" tab body. Receives a resolved resource so the many fields read
// without optional chaining; each section self-hides via InfoArea/InfoRow
// `condition`.
function ResourceDetailsTab({
  data,
  percentComplete,
  moduleProgress,
}: {
  data: Resource;
  percentComplete: string | undefined;
  moduleProgress: ResourceModuleProgress;
}) {
  const topics = data.topics ?? null;
  // Labels are no longer renamed per resource; always use the default.
  const moduleLabel = DEFAULT_MODULE_LABEL;
  return (
    <div className="flex flex-col gap-12">
      <InfoArea
        header="About"
        condition={!!data.description}
      >
        <p>{data.description}</p>
      </InfoArea>
      <InfoRow header="Basic Info">
        <InfoArea
          header="Provider"
          condition={!!data.provider}
        >
          {data.provider && data.provider.name && (
            <Link
              to="/providers/$id"
              from="/resources/$id"
              params={{
                id: data.provider.id + "",
              }}
              className={`
                text-blue-800
                hover:text-blue-600
                dark:text-blue-300
              `}
            >
              {data.provider.name}
            </Link>
          )}
        </InfoArea>
        <InfoArea
          header={`Topic${topics && topics.length > 1 ? "s" : ""}`}
          condition={!!topics}
        >
          <TopicList
            topics={data.topics}
            isPills={false}
          />
        </InfoArea>
        <InfoArea
          header={`Tag${data.tags && data.tags.length > 1 ? "s" : ""}`}
          condition={!!data.tags?.length}
        >
          <div className="flex flex-wrap gap-1">
            {data.tags?.map(tag => (
              <TagChip
                key={tag.id}
                tag={tag.name}
              />
            ))}
          </div>
        </InfoArea>
      </InfoRow>
      <InfoRow header="Progress">
        {data.tracksProgress === false
          ? (
            <span
              className="inline-flex items-center gap-1.5 text-muted-foreground"
            >
              <InfinityIcon className="size-5" />
              No progress tracked
            </span>
          )
          : data.modulesAreExhaustive
            ? (
              <ModuleProgressDisplay
                progress={moduleProgress.progress}
                groups={moduleProgress.groups}
                moduleLabel={moduleLabel}
              />
            )
            : (
              <>
                <InfoArea
                  header="Current Progress"
                  condition={!!data.progressCurrent}
                >
                  <p>{data.progressCurrent}</p>
                </InfoArea>
                <InfoArea
                  header="Total Modules"
                  condition={!!data.progressTotal}
                >
                  <p>{data.progressTotal}</p>
                </InfoArea>
                <InfoArea
                  header="% Complete"
                  condition={!!data.progressTotal && !!data.progressCurrent}
                >
                  <p>{percentComplete}%</p>
                </InfoArea>
                {!data.progressCurrent && !data.progressTotal && (
                  <span>No progress information given.</span>
                )}
              </>
            )}
      </InfoRow>
      <InfoRow
        header="Effort & Engagement"
        condition={
          !!data.easeOfStarting
          || !!data.timeNeeded
          || !!data.interactivity
        }
      >
        <InfoArea
          header="Ease of Starting"
          condition={!!data.easeOfStarting}
        >
          <p className="capitalize">{data.easeOfStarting}</p>
        </InfoArea>
        <InfoArea
          header="Time Needed"
          condition={!!data.timeNeeded}
        >
          <p className="capitalize">{data.timeNeeded}</p>
        </InfoArea>
        <InfoArea
          header="Interactivity"
          condition={!!data.interactivity}
        >
          <p className="capitalize">{data.interactivity}</p>
        </InfoArea>
      </InfoRow>
      <InfoRow
        condition={data.cost?.cost != null}
        header="Money Things"
      >
        <div className="flex flex-row gap-1">
          <InfoArea
            header="Resource Cost"
            condition={!percentComplete}
          >
            <p>{data.cost?.cost}</p>
          </InfoArea>
          <InfoArea
            header="Cost per Unit"
            condition={!!percentComplete}
          >
            <p>
              <span>
                $
                {Number(
                  Number(data.cost?.cost) / Number(percentComplete),
                ).toFixed(2)}{" "}
                out of ${data.cost?.cost}
              </span>
            </p>
          </InfoArea>
        </div>
      </InfoRow>
    </div>
  );
}

// Module Tracking progress: completed/total/% derived from the resource's
// modules (and count-only groups), shown instead of the manual progress fields.
// When the resource has groups, group-level stats sit above the module stats and
// an expandable table breaks progress down per group.
function ModuleProgressDisplay({
  progress,
  groups,
  moduleLabel,
}: {
  progress: ModuleProgress;
  groups: GroupProgress[];
  moduleLabel: string;
}) {
  const {
    completedCount,
    totalCount,
    percentComplete,
  } = progress;

  if (totalCount === 0) {
    return <span>No {moduleLabel.toLowerCase()}s added yet.</span>;
  }

  const totalGroups = groups.length;
  const groupsCompleted = groups.filter(g => g.isComplete).length;

  return (
    <div className="flex w-full flex-col gap-4">
      {totalGroups > 0 && (
        <div className="flex flex-row gap-8">
          <InfoArea header="Groups Completed">
            <p>{groupsCompleted}</p>
          </InfoArea>
          <InfoArea header="Total Groups">
            <p>{totalGroups}</p>
          </InfoArea>
        </div>
      )}
      <div className="flex flex-row gap-8">
        <InfoArea header={`${moduleLabel}s Completed`}>
          <p>{completedCount}</p>
        </InfoArea>
        <InfoArea header={`Total ${moduleLabel}s`}>
          <p>{totalCount}</p>
        </InfoArea>
        <InfoArea header="% Complete">
          <p>{percentComplete}%</p>
        </InfoArea>
      </div>
      {totalGroups > 0 && <ModuleGroupBreakdown groups={groups} />}
    </div>
  );
}
