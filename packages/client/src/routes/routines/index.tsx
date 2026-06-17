import type {
  Routine,
  RoutineConnectionType,
  RoutineTodayAction,
  RoutineWeekday,
} from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheckIcon, PlusIcon } from "lucide-react";

import { RoutinesList } from "./-components/-RoutinesList";

import { PageActions } from "@/components/layout/PageActions";
import {
  EntityError,
  EntityPending,
  PageHeader,
} from "@/components/listControls";
import { weeklyEntryName } from "@/components/routines/weekly";
import { Button } from "@/components/ui/button";
import { useTaskResourceNames } from "@/hooks/useTaskResourceNames";
import { fetchRoutines } from "@/utils";

export interface RoutinesSearch {
  // Legacy alias: `?topicId=` still prefilters by that topic connection.
  topicId?: string;
  connectedType?: RoutineConnectionType;
  connectedId?: string;
}

export const Route = createFileRoute("/routines/")({
  component: Routines,
  errorComponent: RoutinesError,
  pendingComponent: RoutinesPending,
  validateSearch: (search: Record<string, unknown>): RoutinesSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
    connectedType:
      search.connectedType === "topic"
      || search.connectedType === "task"
      || search.connectedType === "resource"
        ? search.connectedType
        : undefined,
    connectedId:
      typeof search.connectedId === "string" && search.connectedId
        ? search.connectedId
        : undefined,
  }),
});

function RoutinesPending() {
  return <EntityPending entity="routines" />;
}

function RoutinesError() {
  return <EntityError entity="routines" />;
}

function Routines() {
  const urlSearch = Route.useSearch();
  const initialConnection
    = urlSearch.connectedType && urlSearch.connectedId
      ? `${urlSearch.connectedType}:${urlSearch.connectedId}`
      : urlSearch.topicId
        ? `topic:${urlSearch.topicId}`
        : undefined;

  const {
    data: routines,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: () => fetchRoutines(),
  });

  // Resolve scheduled task / resource / module names so a weekly routine can show
  // today's entry in place of its name (freeform entries carry their own text in
  // `id`; a resource entry may narrow to a module or group).
  const {
    taskNames, resourceNames, moduleNames, moduleGroupNames,
  } = useTaskResourceNames();
  const todayWeekday = String(new Date().getDay()) as RoutineWeekday;

  // Today's scheduled entry for a weekly routine, resolved to a display name plus
  // any prepend/append affixes. Daily routines and unscheduled weekdays return
  // null, so the card keeps showing the routine name.
  function resolveTodayAction(routine: Routine): RoutineTodayAction | null {
    if ((routine.mode ?? "weekly") === "daily") {
      return null;
    }
    const entry = routine.weekly?.[todayWeekday];
    if (!entry || !entry.id) {
      return null;
    }
    return {
      name: weeklyEntryName(
        entry,
        taskNames,
        resourceNames,
        moduleNames,
        moduleGroupNames,
      ),
      prependText: entry.prependText,
      appendText: entry.appendText,
    };
  }

  return (
    <div>
      <PageActions>
        <Link
          to="/routines/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button variant="outline">
            <PlusIcon className="size-4" />
            New Routine
          </Button>
        </Link>
      </PageActions>
      <PageHeader
        pageTitle="Routines"
        pageSection=""
      >
        <Link to="/routines/tracker">
          <Button variant="outline">
            <CalendarCheckIcon className="size-4" />
            Daily Tracker
          </Button>
        </Link>
      </PageHeader>
      <RoutinesList
        routines={routines ?? []}
        resolveTodayAction={resolveTodayAction}
        initialConnection={initialConnection}
      />
    </div>
  );
}
