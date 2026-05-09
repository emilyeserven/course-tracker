import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon, RadarIcon } from "lucide-react";

import { EntityError, EntityPending } from "@/components/EntityStates";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { RadarChart } from "@/components/radar/RadarChart";
import { Button } from "@/components/ui/button";
import { fetchRadar, fetchSingleDomain } from "@/utils";

export const Route = createFileRoute("/domains/$id/")({
  component: SingleDomain,
});

function SingleDomain() {
  const {
    id,
  } = Route.useParams();
  const navigate = useNavigate();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["domain", id],
    queryFn: () => fetchSingleDomain(id),
  });

  const {
    data: radarData,
  } = useQuery({
    queryKey: ["radar", id],
    queryFn: () => fetchRadar(id),
    enabled: !!data?.hasRadar,
  });

  if (isPending) {
    return <EntityPending entity="domain" />;
  }

  if (error) {
    return <EntityError entity="domain" />;
  }

  const excludedTopics = data?.excludedTopics ?? [];
  const radarReady
    = !!data?.hasRadar
      && !!radarData
      && radarData.quadrants.length > 0
      && radarData.rings.length > 0;

  const blipTopicIds = new Set(
    (radarData?.blips ?? []).map(blip => blip.topicId),
  );
  const allTopics = data?.topics ?? [];
  const topicsNotOnRadar = allTopics.filter(t => !blipTopicIds.has(t.id));
  const topicsOnRadar = allTopics.filter(t => blipTopicIds.has(t.id));

  return (
    <div>
      <PageHeader
        pageTitle={data?.title || "(Untitled Domain)"}
        pageSection="domains"
      >
        <div className="flex flex-row gap-2">
          {data?.hasRadar && (
            <Link
              to="/domains/$id/radar"
              params={{
                id: data?.id + "",
              }}
            >
              <Button>
                View Radar
                {" "}
                <RadarIcon />
              </Button>
            </Link>
          )}
          <Link
            to="/domains/$id/edit"
            params={{
              id: data?.id + "",
            }}
          >
            <Button variant="secondary">
              Edit Domain
              {" "}
              <EditIcon />
            </Button>
          </Link>
        </div>
      </PageHeader>
      <div className="container flex flex-col gap-12">
        <div
          className={`
            grid grid-cols-1 gap-8
            md:grid-cols-2
          `}
        >
          <InfoArea
            header="About"
            condition={!!data?.description}
          >
            <div className="rounded-md border bg-card p-4">
              <p>{data?.description}</p>
            </div>
          </InfoArea>
          {radarReady && radarData && (
            <InfoArea header="Radar">
              <div
                className="flex justify-center rounded-md border bg-card p-4"
              >
                <RadarChart
                  quadrants={radarData.quadrants}
                  rings={radarData.rings}
                  blips={radarData.blips}
                  size={400}
                  showLegend={false}
                  onBlipClick={blip =>
                    navigate({
                      to: "/domains/$id/radar",
                      params: {
                        id,
                      },
                      search: {
                        blipId: blip.id,
                      },
                    })}
                />
              </div>
            </InfoArea>
          )}
        </div>
        <div
          className={`
            grid grid-cols-1 gap-8
            md:grid-cols-2
          `}
        >
          <InfoArea
            header="Topics not on Radar"
            condition={topicsNotOnRadar.length > 0}
          >
            <ul className="ml-5 list-disc">
              {topicsNotOnRadar.map(topic => (
                <li key={topic.id}>
                  <Link
                    to="/topics/$id"
                    params={{
                      id: topic.id + "",
                    }}
                    className={`
                      font-bold text-blue-800
                      hover:text-blue-600
                    `}
                  >
                    {topic.name}
                  </Link>
                  {topic.courses && topic.courses.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (
                      {topic.courses.length}
                      {" course"}
                      {topic.courses.length === 1 ? "" : "s"}
                      )
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </InfoArea>
          <InfoArea
            header="Topics on Radar"
            condition={topicsOnRadar.length > 0}
          >
            <ul className="ml-5 list-disc">
              {topicsOnRadar.map(topic => (
                <li key={topic.id}>
                  <Link
                    to="/topics/$id"
                    params={{
                      id: topic.id + "",
                    }}
                    className={`
                      font-bold text-blue-800
                      hover:text-blue-600
                    `}
                  >
                    {topic.name}
                  </Link>
                  {topic.courses && topic.courses.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (
                      {topic.courses.length}
                      {" course"}
                      {topic.courses.length === 1 ? "" : "s"}
                      )
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </InfoArea>
        </div>
        <InfoArea
          header="Topics excluded from Radar"
          condition={excludedTopics.length > 0}
        >
          <ul className="ml-5 flex list-disc flex-col gap-1">
            {excludedTopics.map(topic => (
              <li key={topic.id}>
                <Link
                  to="/topics/$id"
                  params={{
                    id: topic.id,
                  }}
                  className={`
                    font-bold text-blue-800
                    hover:text-blue-600
                  `}
                >
                  {topic.name}
                </Link>
                {topic.reason && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    —
                    {" "}
                    {topic.reason}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </InfoArea>
      </div>
    </div>
  );
}
