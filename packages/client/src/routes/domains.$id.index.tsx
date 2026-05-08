import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CopyIcon, EditIcon, RadarIcon } from "lucide-react";
import { toast } from "sonner";

import { YesNoDisplay } from "@/components/boxElements/YesNoDisplay";
import { DomainLearningLog } from "@/components/domains/DomainLearningLog";
import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import {
  deleteSingleDomain,
  duplicateDomain,
  fetchSingleDomain,
} from "@/utils";

export const Route = createFileRoute("/domains/$id/")({
  component: SingleDomain,
});

function SingleDomain() {
  const {
    id,
  } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  async function handleDuplicate() {
    try {
      const result = await duplicateDomain(id);
      await queryClient.invalidateQueries({
        queryKey: ["domains"],
      });
      await navigate({
        to: "/domains/$id",
        params: {
          id: result.id,
        },
      });
    }
    catch {
      toast.error("Failed to duplicate domain. Please try again.");
    }
  }

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

  const excludedTopics = data?.excludedTopics ?? [];
  const learningLog = data?.learningLog ?? [];

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
          <Button
            variant="secondary"
            onClick={handleDuplicate}
          >
            Duplicate
            {" "}
            <CopyIcon />
          </Button>
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
        {data && (
          <DomainLearningLog
            domainId={data.id}
            entries={learningLog}
          />
        )}
        <div>
          <DeleteButton onClick={handleDelete}>Delete Domain</DeleteButton>
        </div>
      </div>
    </div>
  );
}
