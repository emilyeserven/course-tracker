import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";

import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteSingleDaily, fetchSingleDaily } from "@/utils";

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
    <DailyPending />;
  }

  if (error) {
    <DailyError />;
  }

  async function handleDelete() {
    await deleteDaily();
    await navigate({
      to: "/dailies",
    });
  }

  const completionsCount = data?.completions?.filter(
    c => c.status !== "incomplete",
  ).length ?? 0;

  return (
    <div>
      <PageHeader
        pageTitle={data?.name}
        pageSection="dailies"
      >
        <div className="flex flex-row gap-2">
          <Link
            to="/dailies/$id/edit"
            params={{
              id: data?.id + "",
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
          condition={!!data?.description}
        >
          <p>{data?.description}</p>
        </InfoArea>
        <InfoArea
          header="Location"
          condition={!!data?.location}
        >
          <p>{data?.location}</p>
        </InfoArea>
        <InfoArea
          header="Provider"
          condition={!!data?.provider}
        >
          <p>{data?.provider?.name}</p>
        </InfoArea>
        <InfoArea
          header="Completions logged"
          condition={!!data}
        >
          <p>{completionsCount}</p>
        </InfoArea>
        <div>
          <DeleteButton onClick={handleDelete}>Delete Daily</DeleteButton>
        </div>
      </div>
    </div>
  );
}
