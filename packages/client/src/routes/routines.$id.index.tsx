import type { DailyDetailTab } from "@/components/dailies/dailyStatusMeta";
import type { Daily, DailyCompletionStatus } from "@emstack/types";

import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon, FlameIcon, LaughIcon } from "lucide-react";
import { toast } from "sonner";

import { EntityLink } from "@/components/boxElements/EntityLink";
import { DashboardCard } from "@/components/boxes/DashboardCard";
import { TodayStatusCell } from "@/components/dailies";
import { DailyDetailsPanel } from "@/components/dailies/DailyDetailsPanel";
import { DAILY_DETAIL_TABS } from "@/components/dailies/dailyStatusMeta";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoutineEntryLabel } from "@/components/routines/RoutineEntryLabel";
import {
  DAY_LABELS,
  DAY_ORDER,
} from "@/components/routines/weekly";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import {
  connectionEntityKind,
  fetchResources,
  fetchSingleRoutine,
  fetchTasks,
  findStatusForDate,
  getCurrentChain,
  getTodayKey,
  getTotalCompletedDays,
  isWeeklyTargetMet,
  upsertRoutine,
  withCompletion,
  withCompletionNote,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export interface RoutineViewSearch {
  tab?: DailyDetailTab;
}

export const Route = createFileRoute("/routines/$id/")({
  component: SingleRoutine,
  validateSearch: (search: Record<string, unknown>): RoutineViewSearch => {
    const value = search.tab;
    if (
      typeof value === "string"
      && (DAILY_DETAIL_TABS as readonly string[]).includes(value)
    ) {
      return {
        tab: value as DailyDetailTab,
      };
    }
    return {};
  },
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

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    settings,
  } = useSettings();
  const search = Route.useSearch();
  const tab: DailyDetailTab = search.tab ?? "details";

  function changeTab(next: DailyDetailTab) {
    navigate({
      to: "/routines/$id",
      params: {
        id,
      },
      search: {
        tab: next,
      },
      replace: true,
    });
  }

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
    queryKey: queryKeys.resources.list(),
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

  const todayDateKey = getTodayKey();

  // Marks today's completion status (incomplete/touched/goal/exceeded/freeze)
  // for this routine — the same daily-status concept the dashboard table edits.
  // Sends a partial body (name + completions), so the upsert preserves the
  // routine's weekly grid, connections, criteria and overall status.
  const statusMutation = useMutation({
    mutationFn: ({
      daily,
      status,
      note,
    }: {
      daily: Daily;
      status: DailyCompletionStatus;
      note?: string | null;
    }) => {
      const withStatus = withCompletion(daily, todayDateKey, status);
      const completions
        = note === undefined
          ? withStatus
          : withCompletionNote(
            {
              ...daily,
              completions: withStatus,
            },
            todayDateKey,
            note,
          );
      return upsertRoutine(daily.id, {
        name: daily.name,
        completions,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["routine", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
      });
      toast.success("Status updated.");
    },
    onError: () => {
      toast.error("Failed to update status.");
    },
  });

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
  // The same day of the week as today (JS getDay: "0" = Sunday … "6" = Saturday).
  // Daily routines mirror their entry onto every day, so this resolves to the
  // single daily item; weekly routines resolve to today's scheduled entry (if any).
  const todayKey = String(new Date().getDay());
  const todayEntry = isDaily
    ? dailyEntry
    : (weekly[todayKey as keyof typeof weekly] ?? null);
  const completions = data.completions ?? [];
  // Daily-mode routines with a met weekly target need nothing more today.
  const weekTargetMet
    = isDaily
      && isWeeklyTargetMet(
        {
          completions,
          weeklyTarget: data.weeklyTarget ?? null,
        },
        todayDateKey,
        settings.weekTargetWindow,
      );
  const chain = getCurrentChain({
    completions,
  });
  const total = getTotalCompletedDays({
    completions,
  });

  // A Daily-shaped view of this routine for the shared today's-status modal,
  // which only reads name / completions / criteria / description.
  const dailyForStatus: Daily = {
    id: data.id,
    name: data.name,
    description: data.description,
    completions: data.completions ?? [],
    criteria: data.criteria ?? null,
    status: data.status,
  };
  const todayStatus = findStatusForDate(dailyForStatus, todayDateKey);
  const statusControl = (
    <div className="w-40">
      <TodayStatusCell
        daily={dailyForStatus}
        currentStatus={todayStatus}
        disabled={statusMutation.isPending}
        onChange={(status, note) =>
          statusMutation.mutate({
            daily: dailyForStatus,
            status,
            note,
          })}
      />
    </div>
  );

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
        <DashboardCard
          title="Today's Task"
          action={statusControl}
        >
          {todayEntry
            ? (
              <>
                <p className="text-lg font-medium">
                  <RoutineEntryLabel
                    entry={todayEntry}
                    taskNames={taskNames}
                    resourceNames={resourceNames}
                    showMeta={false}
                  />
                </p>
                {todayEntry.notes && (
                  <p className="text-sm text-muted-foreground">
                    {todayEntry.notes}
                  </p>
                )}
              </>
            )
            : (
              <p className="text-muted-foreground italic">
                Nothing, take a break!
              </p>
            )}
          {weekTargetMet && (
            <p className="mt-2 text-sm text-muted-foreground italic">
              Nothing required today — weekly goal met.
            </p>
          )}
        </DashboardCard>
        <DailyDetailsPanel
          dailyId={id}
          tab={tab}
          onTabChange={changeTab}
          criteriaEmptyAction={(
            <Link
              to="/routines/$id/edit"
              params={{
                id,
              }}
              search={{
                tab: "criteria",
              }}
            >
              <Button
                variant="secondary"
                size="sm"
              >
                Add Status Criteria
                {" "}
                <EditIcon />
              </Button>
            </Link>
          )}
          detailsContent={(
            <div className="flex flex-col gap-12">
              <div
                className="
                  grid grid-cols-1 gap-12
                  md:grid-cols-4
                "
              >
                <InfoArea
                  header="Type"
                  condition={true}
                >
                  <span
                    className="
                      inline-flex items-center rounded-full px-2.5 py-0.5
                      text-xs font-medium
                    "
                  >
                    {isDaily ? "Daily Task" : "Weekly Schedule"}
                  </span>
                </InfoArea>
                <InfoArea
                  header="Status"
                  condition={true}
                >
                  <span className="capitalize">{data.status ?? "active"}</span>
                </InfoArea>
                <div className="md:col-span-2">
                  <InfoArea
                    header="Stats"
                    condition={true}
                  >
                    <div className="flex flex-row flex-wrap gap-6 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <FlameIcon
                          size={16}
                          className={chain > 0
                            ? "text-orange-600"
                            : "text-muted-foreground"}
                        />
                        <strong>{chain}</strong>
                        <span className="text-muted-foreground">day chain</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <LaughIcon
                          size={16}
                          className={total > 0
                            ? "text-emerald-600"
                            : "text-muted-foreground"}
                        />
                        <strong>{total}</strong>
                        <span className="text-muted-foreground">total days</span>
                      </span>
                    </div>
                  </InfoArea>
                </div>
              </div>
              <InfoArea
                header="Connected To"
                condition={(data.connections?.length ?? 0) > 0}
              >
                <ul className="flex flex-col gap-1">
                  {data.connections?.map(c => (
                    <li key={`${c.type}:${c.id}`}>
                      <EntityLink
                        entity={connectionEntityKind(c.type)}
                        id={c.id}
                        className={`
                          font-bold text-blue-800
                          hover:text-blue-600
                          dark:text-blue-300
                        `}
                      >
                        <span
                          className="
                            mr-2 text-xs text-muted-foreground uppercase
                          "
                        >
                          {c.type}
                        </span>
                        {c.name ?? c.id}
                      </EntityLink>
                    </li>
                  ))}
                </ul>
              </InfoArea>
              {!isDaily && (
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
                            grid grid-cols-[120px_1fr] items-center gap-2
                            border-b border-border/60 py-1
                          "
                        >
                          <span className="text-sm font-medium">
                            {DAY_LABELS[day]}
                          </span>
                          {entry
                            ? (
                              <RoutineEntryLabel
                                entry={entry}
                                taskNames={taskNames}
                                resourceNames={resourceNames}
                              />
                            )
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
            </div>
          )}
        />
      </div>
    </div>
  );
}
