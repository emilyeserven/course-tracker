import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";

import { Button } from "@/components/button";
import { fetchSingleTopic } from "@/utils/fetchFunctions";

export const Route = createFileRoute("/topics/$id/")({
  component: SingleTopic,
});

function TopicPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your topics...</h1>
    </div>
  );
}

function TopicError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading your topics.</h1>
      <p>
        Try to use the
        {" "}
        <Link to="/onboard">Onboarding Wizard</Link>
        {" "}
        again, or load in properly formed course data.
      </p>
    </div>
  );
}

function SingleTopic() {
  const {
    id,
  } = Route.useParams();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["topic", id],
    queryFn: () => fetchSingleTopic(id),
  });

  if (isPending) {
    <TopicPending />;
  }

  if (error) {
    <TopicError />;
  }

  return (
    <div>
      <div className="flex flex-row gap-3">
        <Link
          to="/topics"
          className="mb-8 flex flex-row"
        >
          Topics
        </Link>
        <span>/</span>
        <span className="font-bold">{data?.name}</span>
      </div>
      <span className="mb-4 text-lg">TOPIC</span>
      <h1 className="mb-4 text-3xl">{data?.name}</h1>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col">
          {data?.description && (
            <p>
              {data.description}
            </p>
          )}

          {data?.reason && (
            <p>
              {data.reason}
            </p>
          )}
        </div>
        <div className="flex flex-row gap-2">
          <Link
            to="/courses/$id/edit"
            params={{
              id: data?.id + "",
            }}
          >
            <Button variant="secondary">
              Edit Topic
              {" "}
              <EditIcon />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
