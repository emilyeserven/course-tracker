import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheckIcon, ListTodoIcon } from "lucide-react";

import { OverviewCardGrid } from "@/components/boxes/OverviewCardGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";

export const Route = createFileRoute("/actions")({
  component: Actions,
});

function Actions() {
  return (
    <div>
      <PageHeader
        pageTitle="Actions"
        description="The things you actually do — recurring routines and one-off tasks that move your learning forward."
      />
      <div className="container">
        <OverviewCardGrid
          className="md:grid-cols-2"
          items={[
            {
              to: "/routines",
              title: "Routines",
              description: ENTITY_DESCRIPTIONS.routines,
              icon: CalendarCheckIcon,
            },
            {
              to: "/tasks",
              title: "Tasks",
              description: ENTITY_DESCRIPTIONS.tasks,
              icon: ListTodoIcon,
            },
          ]}
        />
      </div>
    </div>
  );
}
