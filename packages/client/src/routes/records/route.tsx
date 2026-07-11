import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpenIcon, Building2Icon } from "lucide-react";

import { OverviewCardGrid, PageHeader } from "@/components/layout";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchProviders, fetchResources } from "@/utils";
import {
  providerConnectionCount,
  resourceConnectionCount,
} from "@/utils/connectionCounts";
import { queryKeys } from "@/utils/queryKeys";
import { topConnected } from "@/utils/topConnected";

export const Route = createFileRoute("/records")({
  component: Records,
});

function Records() {
  const {
    data: providers,
  } = useQuery({
    queryKey: queryKeys.providers.list(),
    queryFn: () => fetchProviders(),
  });
  const {
    data: resources,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });

  return (
    <div>
      <PageHeader
        pageTitle="Records"
        description="Everything you're learning from — the providers and resources that make up your knowledge base."
      />
      <div className="container">
        <OverviewCardGrid
          items={[
            {
              to: "/providers",
              title: "Providers",
              description: ENTITY_DESCRIPTIONS.providers,
              icon: Building2Icon,
              entity: "providers",
              topConnected: topConnected(
                providers,
                p => p.name,
                providerConnectionCount,
              ),
            },
            {
              to: "/resources",
              title: "Resources",
              description: ENTITY_DESCRIPTIONS.resources,
              icon: BookOpenIcon,
              entity: "resources",
              topConnected: topConnected(
                resources,
                r => r.name,
                resourceConnectionCount,
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
