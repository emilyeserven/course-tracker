import type { DailyDetailTab } from "@/components/dailies/dailyStatusMeta";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon, FlameIcon, LaughIcon } from "lucide-react";

import { EntityLink } from "@/components/boxElements/EntityLink";
import { DashboardCard } from "@/components/boxes/DashboardCard";
import { ActionableSentence } from "@/components/dailies/ActionableSentence";
import { DailyDetailsPanel } from "@/components/dailies/DailyDetailsPanel";
import { DAILY_DETAIL_TABS } from "@/components/dailies/dailyStatusMeta";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DAY_LABELS,
  DAY_ORDER,
} from "@/components/routines/weekly";
import { Button } from "@/components/ui/button";
import {
  connectionEntityKind,
  fetchResources,
  fetchSingleRoutine,
  fetchTasks,
  getCurrentChain,
  getTotalCompletedDays,
} from "@/utils";

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
  const completions = data.completions ?? [];
  const chain = getCurrentChain({
    completions,
  });
  const total = getTotalCompletedDays({
    completions,
  });

  // The entry's name as a clickable link (task / resource) or plain text
  // (freeform) — no type badge, so it can sit inside an actionable sentence.
  function entryNameLink(entry: { type: string;
    id: string; }) {
    if (entry.type === "freeform") {
      return entry.id;
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
        {entry.type === "task"
          ? (taskNames.get(entry.id) ?? entry.id)
          : (resourceNames.get(entry.id) ?? entry.id)}
      </Link>
    );
  }

  // prepend text + linked name + append text, forming the actionable sentence
  // while keeping the name itself clickable. The affixes render a notch lighter
  // than the name so the resource itself stands out.
  function renderActionable(entry: { type: string;
    id: string;
    prependText?: string | null;
    appendText?: string | null; }) {
    return (
      <ActionableSentence
        prependText={entry.prependText}
        appendText={entry.appendText}
        name={entryNameLink(entry)}
      />
    );
  }

  function renderEntryLink(entry: { type: string;
    id: string;
    notes?: string | null;
    prependText?: string | null;
    appendText?: string | null; }) {
    const main = (
      <span className="text-sm">
        <span className="mr-2 text-xs text-muted-foreground uppercase">
          {entry.type}
        </span>
        {renderActionable(entry)}
      </span>
    );

    if (!entry.notes) {
      return main;
    }

    return (
      <span className="flex flex-col gap-0.5">
        {main}
        <span className="text-sm text-muted-foreground">{entry.notes}</span>
      </span>
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
        {isDaily && dailyEntry && (
          <DashboardCard title="Daily Task">
            <p className="text-lg font-medium">
              {renderActionable(dailyEntry)}
            </p>
            {dailyEntry.notes && (
              <p className="text-sm text-muted-foreground">
                {dailyEntry.notes}
              </p>
            )}
          </DashboardCard>
        )}
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
                      inline-flex items-center rounded-full border px-2.5 py-0.5
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
            </div>
          )}
        />
      </div>
    </div>
  );
}
