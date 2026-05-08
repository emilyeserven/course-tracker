import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon, EditIcon } from "lucide-react";

import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { RadarChart } from "@/components/radar/RadarChart";
import { Button } from "@/components/ui/button";
import { fetchRadar } from "@/utils";

export const Route = createFileRoute("/domains/$id/radar/")({
  component: RadarView,
});

function RadarView() {
  const {
    id,
  } = Route.useParams();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["radar", id],
    queryFn: () => fetchRadar(id),
  });

  if (isPending) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-3xl">Loading radar...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-3xl">There was an error loading the radar.</h1>
      </div>
    );
  }

  const isEmpty
    = !data || data.quadrants.length === 0 || data.rings.length === 0;

  return (
    <div>
      <PageHeader
        pageTitle={data ? `${data.domainTitle} Radar` : "Radar"}
        pageSection="domains"
      >
        <div className="flex flex-row gap-2">
          <Link
            to="/domains/$id"
            params={{
              id,
            }}
          >
            <Button variant="outline">
              <ArrowLeftIcon />
              {" "}
              Back to Domain
            </Button>
          </Link>
          <Link
            to="/domains/$id/radar/edit"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              Edit Radar
              {" "}
              <EditIcon />
            </Button>
          </Link>
        </div>
      </PageHeader>
      <div className="container flex flex-col gap-8">
        {isEmpty
          ? (
            <InfoArea header="Get Started">
              <div className="flex flex-col gap-4 py-4">
                <p>
                  This radar has not been configured yet. Define quadrants and
                  rings before adding blips.
                </p>
                <Link
                  to="/domains/$id/radar/edit"
                  params={{
                    id,
                  }}
                >
                  <Button>Configure Radar</Button>
                </Link>
              </div>
            </InfoArea>
          )
          : (
            <RadarChart
              quadrants={data.quadrants}
              rings={data.rings}
              blips={data.blips}
            />
          )}
      </div>
    </div>
  );
}
