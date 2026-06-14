/* eslint-disable import/max-dependencies -- route page composes several colocated section components */
import type { DailyDetailTab } from "@/components/dailies";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";

import { DailyDetailsPanel } from "./-components/-DailyDetailsPanel";
import { RoutineDetailsContent } from "./-components/-RoutineDetailsContent";
import { RoutineTodayCard } from "./-components/-RoutineTodayCard";

import { DAILY_DETAIL_TABS } from "@/components/dailies";
import { PageHeader } from "@/components/layout";
import { EntityError, EntityPending } from "@/components/listControls/EntityStates";
import { Button } from "@/components/ui/button";
import { fetchSingleRoutine } from "@/utils";

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

  if (isPending) {
    return <RoutinePending />;
  }

  if (error || !data) {
    return <RoutineError />;
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
        <RoutineTodayCard data={data} />
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
          detailsContent={<RoutineDetailsContent data={data} />}
        />
      </div>
    </div>
  );
}
