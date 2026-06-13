import { createFileRoute } from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";

import { CriteriaTemplatesSection } from "./settings.-components/-CriteriaTemplatesSection";
import { DashboardLayoutsSection } from "./settings.-components/-DashboardLayoutsSection";
import { DataToolsSection } from "./settings.-components/-DataToolsSection";
import { ReadwiseSection } from "./settings.-components/-ReadwiseSection";
import { RoutineTemplatesSection } from "./settings.-components/-RoutineTemplatesSection";
import { TaskTypesSection } from "./settings.-components/-TaskTypesSection";

import { PageHeader } from "@/components/layout/PageHeader";
import { TagGroupsAdmin } from "@/components/TagGroupsAdmin";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme.ts";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const {
    theme, setTheme,
  } = useTheme();

  return (
    <div>
      <PageHeader pageTitle="Settings" />
      <div className="container flex flex-col gap-8">
        <DataToolsSection />

        <TaskTypesSection />

        <TagGroupsAdmin />

        <CriteriaTemplatesSection />

        <RoutineTemplatesSection />

        <DashboardLayoutsSection />

        <ReadwiseSection />

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <div className="flex flex-col items-start gap-2">
            {theme === "dark"
              ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTheme("light");
                  }}
                >
                  <SunIcon />
                  Set to Light Mode
                </Button>
              )
              : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTheme("dark");
                  }}
                >
                  <MoonIcon />
                  Set to Dark Mode
                </Button>
              )}
          </div>
        </section>
      </div>
    </div>
  );
}
