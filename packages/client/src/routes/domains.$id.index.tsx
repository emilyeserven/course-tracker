import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon, RadarIcon } from "lucide-react";

import { YesNoDisplay } from "@/components/boxElements/YesNoDisplay";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteSingleDomain, fetchSingleDomain } from "@/utils";

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
    refetch: deleteDomain,
  } = useQuery({
    queryKey: ["domain", "delete", id],
    enabled: false,
    queryFn: () => deleteSingleDomain(id),
  });

  if (isPending) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-3xl">Hold on, loading your domain...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-3xl">
          There was an error loading this domain.
        </h1>
      </div>
    );
  }

  async function handleDelete() {
    await deleteDomain();
    await navigate({
      to: "/domains",
    });
  }

  return (
    <div>
      <PageHeader
        pageTitle={data?.title}
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
        <InfoArea
          header="About"
          condition={!!data?.description}
        >
          <p>{data?.description}</p>
        </InfoArea>
        <InfoArea header="Has Radar?">
          <YesNoDisplay value={!!data?.hasRadar} />
        </InfoArea>
        <div>
          <InfoArea
            header="Topics"
            condition={!!data?.topicCount && data.topicCount > 0}
          >
            <ul className="ml-5 list-disc">
              {data?.topics
                && data.topics.map(topic => (
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
                  </li>
                ))}
            </ul>
          </InfoArea>
        </div>
        <div>
          <DeleteButton onClick={handleDelete}>Delete Domain</DeleteButton>
        </div>
      </div>
    </div>
  );
}
