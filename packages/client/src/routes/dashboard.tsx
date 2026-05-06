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
          container grid grid-cols-1 gap-4
          md:grid-cols-2
        "
      >
        <DashboardDailies />
        <DashboardCoursesInProgress />
      </div>
    </div>
  );
}
