import { createFileRoute } from "@tanstack/react-router";
import { RadarIcon } from "lucide-react";

import { OverviewCardGrid } from "@/components/boxes/OverviewCardGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";

export const Route = createFileRoute("/plans")({
  component: Plans,
});

function Plans() {
  return (
    <div>
      <PageHeader
        pageTitle="Plans"
        description="The big-picture areas of expertise you're working toward and how their topics fit together."
      />
      <div className="container">
        <OverviewCardGrid
          className="
            max-w-md
            sm:grid-cols-1
            md:grid-cols-1
          "
          items={[
            {
              to: "/domains",
              title: "Domains",
              description: ENTITY_DESCRIPTIONS.domains,
              icon: RadarIcon,
            },
          ]}
        />
      </div>
    </div>
  );
}
