import { createFileRoute } from "@tanstack/react-router";

import { DashboardCoursesInProgress } from "./dashboard.-components/-DashboardCoursesInProgress";
import { DashboardDailies } from "./dashboard.-components/-DashboardDailies";

import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div>
      <PageHeader pageTitle="Dashboard" />
      <div
        className="
          container flex flex-col gap-3
          md:flex-row md:items-start
        "
      >
        <div
          className="
            min-w-0
            md:flex-1
          "
        >
          <DashboardDailies />
        </div>
        <div
          className="
            min-w-0
            md:flex-1
          "
        >
          <DashboardCoursesInProgress />
        </div>
      </div>
    </div>
  );
}
