import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon, ExternalLink, FlameIcon, LaughIcon } from "lucide-react";

import {
  DailyCompletionsManager,
  DailyRecentDaysStrip,
} from "@/components/dailies";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import {
  deleteSingleDaily,
  fetchSingleDaily,
  getCurrentChain,
  getTotalCompletedDays,
  isHttpUrl,
} from "@/utils";

export const Route = createFileRoute("/dailies/$id/")({
  component: SingleDaily,
});

function DailyPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your daily...</h1>
    </div>
  );
}

function DailyError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading this daily.</h1>
    </div>
  );
}

function SingleDaily() {
  const {
    id,
  } = Route.useParams();
  const navigate = useNavigate();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["daily", id],
    queryFn: () => fetchSingleDaily(id),
  });

  const {
    refetch: deleteDaily,
  } = useQuery({
    queryKey: ["dailies", "delete", id],
    enabled: false,
    queryFn: () => deleteSingleDaily(id),
  });

  if (isPending) {
    return <DailyPending />;
  }

  if (error || !data) {
    return <DailyError />;
  }

  async function handleDelete() {
    await deleteDaily();
    await navigate({
      to: "/dailies",
    });
  }

  const total = getTotalCompletedDays(data);
  const chain = getCurrentChain(data);

  return (
    <div>
      <PageHeader
        pageTitle={data.name}
        pageSection="dailies"
      >
        <div className="flex flex-row gap-2">
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
      <div className="container flex flex-col gap-12">
        <InfoArea
          header="Description"
          condition={!!data.description}
        >
          <p>{data.description}</p>
        </InfoArea>
        <InfoArea
          header="Location"
          condition={!!data.location}
        >
          {data.location && isHttpUrl(data.location)
            ? (
              <a
                href={data.location}
                target="_blank"
                rel="noreferrer"
                className="self-start"
              >
                <Button>
                  Open Location
                  <ExternalLink />
                </Button>
              </a>
            )
            : (
              <p>{data.location}</p>
            )}
        </InfoArea>
        <InfoArea
          header="Provider"
          condition={!!data.provider}
        >
          <p>{data.provider?.name}</p>
        </InfoArea>
        <InfoArea
          header="Last 14 days"
          condition={true}
        >
          <DailyRecentDaysStrip
            daily={data}
            count={14}
          />
        </InfoArea>
        <InfoArea
          header="Stats"
          condition={true}
        >
          <div className="flex flex-row flex-wrap gap-6 text-sm">
            <span className="inline-flex items-center gap-1">
              <FlameIcon
                size={16}
                className={chain > 0
                  ? "text-orange-600"
                  : "text-muted-foreground"}
              />
              <strong>{chain}</strong>
              <span className="text-muted-foreground">day chain</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <LaughIcon
                size={16}
                className={total > 0
                  ? "text-emerald-600"
                  : "text-muted-foreground"}
              />
              <strong>{total}</strong>
              <span className="text-muted-foreground">total days</span>
            </span>
          </div>
        </InfoArea>
        <InfoArea
          header="Day entries"
          condition={true}
        >
          <DailyCompletionsManager
            daily={data}
            readOnly
          />
        </InfoArea>
        <div>
          <DeleteButton onClick={handleDelete}>Delete Daily</DeleteButton>
        </div>
      </div>
    </div>
  );
}
