import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpenIcon, Building2Icon, LightbulbIcon } from "lucide-react";

import { OverviewCardGrid } from "@/components/layout/OverviewCardGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchProviders, fetchResources, fetchTopics } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";
import {
  providerConnectionCount,
  resourceConnectionCount,
  topConnected,
  topicConnectionCount,
} from "@/utils/topConnected";

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
  const {
    data: topics,
  } = useQuery({
    queryKey: queryKeys.topics.list(),
    queryFn: () => fetchTopics(),
  });

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
            {
              to: "/topics",
              title: "Topics",
              description: ENTITY_DESCRIPTIONS.topics,
              icon: LightbulbIcon,
              entity: "topics",
              topConnected: topConnected(
                topics,
                t => t.name,
                topicConnectionCount,
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
