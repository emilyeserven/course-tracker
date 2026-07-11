import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { TrackerTables } from "./-components/-TrackerTables";

import { PageHeader } from "@/components/layout";
import {
  EntityError,
  EntityPending,
} from "@/components/listControls/EntityStates";
import { Button } from "@/components/ui/button";
import { useRoutineTracker } from "@/hooks/useRoutineTracker";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";

export const Route = createFileRoute("/routines/tracker")({
  component: DailyTracker,
  errorComponent: TrackerError,
  pendingComponent: TrackerPending,
});

function TrackerPending() {
  return <EntityPending entity="dailies" />;
}

function TrackerError() {
  return <EntityError entity="dailies" />;
}

function DailyTracker() {
  const tracker = useRoutineTracker();

  return (
    <div>
      <PageHeader
        pageTitle="Routine Tracker"
        pageSection="routines"
        description={ENTITY_DESCRIPTIONS.dailies}
      >
        <Link
          to="/routines/$id/edit"
          params={{
            id: "new",
          }}
          search={{
            mode: "daily",
          }}
        >
          <Button>
            <PlusIcon className="size-4" />
            New Daily
          </Button>
        </Link>
      </PageHeader>
      <TrackerTables {...tracker} />
    </div>
  );
}
