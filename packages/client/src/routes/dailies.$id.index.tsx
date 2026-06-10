import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, ExternalLink } from "lucide-react";

import { DailyDetailsPanel } from "@/components/dailies";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useRedirectLinkedDaily } from "@/hooks/useRedirectLinkedDaily";
import { fetchSingleDaily, isHttpUrl } from "@/utils";

export const Route = createFileRoute("/dailies/$id/")({
  component: SingleDaily,
});

function DailyPending() {
  return <EntityPending entity="daily" />;
}

function DailyError() {
  return <EntityError entity="daily" />;
}

function SingleDaily() {
  const {
    id,
  } = Route.useParams();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["daily", id],
    queryFn: () => fetchSingleDaily(id),
  });

  const isRedirecting = useRedirectLinkedDaily({
    daily: data,
    mode: "view",
  });

  if (isPending) {
    return <DailyPending />;
  }

  if (error || !data) {
    return <DailyError />;
  }

  if (isRedirecting) {
    return null;
  }

  const locationIsUrl = !!data.location && isHttpUrl(data.location);

  return (
    <div>
      <PageHeader
        pageTitle={data.name}
        pageSection="dailies"
      >
        <div className="flex flex-row gap-2">
          {locationIsUrl && data.location && (
            <a
              href={data.location}
              target="_blank"
              rel="noreferrer"
            >
              <Button>
                Open Location
                <ExternalLink />
              </Button>
            </a>
          )}
          <Link
            to="/dailies/$id/edit"
            params={{
              id: data.id + "",
            }}
          >
            <Button variant="secondary">
              Edit Daily
              {" "}
              <EditIcon />
            </Button>
          </Link>
        </div>
      </PageHeader>
      <div className="container">
        <DailyDetailsPanel dailyId={id} />
      </div>
    </div>
  );
}
