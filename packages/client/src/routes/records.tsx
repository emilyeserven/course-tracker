import { createFileRoute } from "@tanstack/react-router";
import { BookOpenIcon, Building2Icon, LightbulbIcon } from "lucide-react";

import { OverviewCardGrid } from "@/components/boxes/OverviewCardGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";

export const Route = createFileRoute("/records")({
  component: Records,
});

function Records() {
  return (
    <div>
      <PageHeader
        pageTitle="Records"
        description="Everything you're learning from and about — the providers, resources, and topics that make up your knowledge base."
      />
      <div className="container">
        <OverviewCardGrid
          items={[
            {
              to: "/providers",
              title: "Providers",
              description: ENTITY_DESCRIPTIONS.providers,
              icon: Building2Icon,
            },
            {
              to: "/resources",
              title: "Resources",
              description: ENTITY_DESCRIPTIONS.resources,
              icon: BookOpenIcon,
            },
            {
              to: "/topics",
              title: "Topics",
              description: ENTITY_DESCRIPTIONS.topics,
              icon: LightbulbIcon,
            },
          ]}
        />
      </div>
    </div>
  );
}
