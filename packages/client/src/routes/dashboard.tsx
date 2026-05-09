import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/PageHeader";

import { DashboardCoursesByAmortization } from "./dashboard.-components/-DashboardCoursesByAmortization";
import { DashboardCoursesInProgress } from "./dashboard.-components/-DashboardCoursesInProgress";
import { DashboardDailies } from "./dashboard.-components/-DashboardDailies";
import { DashboardRadars } from "./dashboard.-components/-DashboardRadars";
import { DashboardUnderutilizedProviders } from "./dashboard.-components/-DashboardUnderutilizedProviders";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div>
      <PageHeader pageTitle="Dashboard" />
      <div className="container flex flex-col gap-3">
        <div className="w-full min-w-0">
          <DashboardDailies />
        </div>
        <div
          className="
            flex flex-col gap-3
            md:flex-row md:items-start
          "
        >
          <div
            className="
              min-w-0
              md:flex-1
            "
          >
            <DashboardUnderutilizedProviders />
          </div>
          <div
            className="
              min-w-0
              md:flex-1
            "
          >
            <DashboardCoursesByAmortization />
          </div>
        </div>
        <div
          className="
            flex flex-col gap-3
            md:flex-row md:items-start
          "
        >
          <div
            className="
              min-w-0
              md:flex-1
            "
          >
            <DashboardCoursesInProgress />
          </div>
          <div
            className="
              min-w-0
              md:flex-1
            "
          >
            <DashboardRadars />
          </div>
        </div>
      </div>
    </div>
  );
}
