import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { RadarIcon } from "lucide-react";

import { OverviewCardGrid, PageHeader } from "@/components/layout";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchDomains } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";
import { domainConnectionCount, topConnected } from "@/utils/topConnected";

export const Route = createFileRoute("/plans")({
  component: Plans,
});

function Plans() {
  const {
    data: domains,
  } = useQuery({
    queryKey: queryKeys.domains.list(),
    queryFn: () => fetchDomains(),
  });

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
              entity: "domains",
              topConnected: topConnected(
                domains,
                d => d.title,
                domainConnectionCount,
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
