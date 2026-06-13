import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheckIcon, ListTodoIcon } from "lucide-react";

import { OverviewCardGrid, PageHeader } from "@/components/layout";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchRoutines, fetchTasks } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";
import {
  routineConnectionCount,
  taskConnectionCount,
  topConnected,
} from "@/utils/topConnected";

export const Route = createFileRoute("/actions")({
  component: Actions,
});

function Actions() {
  const {
    data: routines,
  } = useQuery({
    queryKey: queryKeys.routines.list(),
    queryFn: () => fetchRoutines(),
  });
  const {
    data: tasks,
  } = useQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: () => fetchTasks(),
  });

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
              entity: "routines",
              topConnected: topConnected(
                routines,
                r => r.name,
                routineConnectionCount,
              ),
            },
            {
              to: "/tasks",
              title: "Tasks",
              description: ENTITY_DESCRIPTIONS.tasks,
              icon: ListTodoIcon,
              entity: "tasks",
              topConnected: topConnected(
                tasks,
                t => t.name,
                taskConnectionCount,
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
