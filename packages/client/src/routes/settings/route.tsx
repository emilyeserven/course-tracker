import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  BookmarksSection,
  CriteriaTemplatesSection,
  DashboardLayoutsSection,
  DataToolsSection,
  GoogleCalendarSection,
  ReadwiseSection,
  RoutineTemplatesSection,
  TagGroupsAdmin,
  TaskTypesSection,
  ThemeSection,
  TodoistSection,
} from "./-components";

import { PageHeader, PageTabs } from "@/components/layout";

const TAB_VALUES = [
  "tasks",
  "routines",
  "dashboard",
  "connections",
  "display",
  "advanced",
] as const;
type SettingsTab = (typeof TAB_VALUES)[number];

export interface SettingsSearch {
  tab?: SettingsTab;
}

export const Route = createFileRoute("/settings")({
  component: Settings,
  validateSearch: (search: Record<string, unknown>): SettingsSearch => ({
    tab:
      typeof search.tab === "string"
      && (TAB_VALUES as readonly string[]).includes(search.tab)
        ? (search.tab as SettingsTab)
        : undefined,
  }),
});

function Settings() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const tab: SettingsTab = search.tab ?? "tasks";

  function changeTab(next: SettingsTab) {
    navigate({
      to: "/settings",
      search: {
        tab: next,
      },
      replace: true,
    });
  }

  return (
    <div>
      <PageHeader pageTitle="Settings" />
      <div className="container">
        <PageTabs
          value={tab}
          onValueChange={changeTab}
          tabs={[
            {
              value: "tasks",
              label: "Task Settings",
              content: (
                <>
                  <TaskTypesSection />
                  <TagGroupsAdmin />
                </>
              ),
            },
            {
              value: "routines",
              label: "Routine Settings",
              content: (
                <>
                  <CriteriaTemplatesSection />
                  <RoutineTemplatesSection />
                </>
              ),
            },
            {
              value: "dashboard",
              label: "Dashboard Settings",
              content: <DashboardLayoutsSection />,
            },
            {
              value: "connections",
              label: "Third Party Connections",
              content: (
                <>
                  <ReadwiseSection />
                  <TodoistSection />
                  <GoogleCalendarSection />
                  <BookmarksSection />
                </>
              ),
            },
            {
              value: "display",
              label: "Display Settings",
              content: <ThemeSection />,
            },
            {
              value: "advanced",
              label: "Advanced",
              content: <DataToolsSection />,
            },
          ]}
        />
      </div>
    </div>
  );
}
