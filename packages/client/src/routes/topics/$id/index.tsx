import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";

import { DomainLinkList } from "./-components/-DomainLinkList";
import { RoutineLinkList } from "./-components/-RoutineLinkList";

import {
  EntityHeaderButton,
  InfoArea,
  PageHeader,
  ResourceLinksSection,
} from "@/components/layout";
import { EntityError, EntityPending } from "@/components/listControls/EntityStates";
import { fetchRoutines, fetchSingleTopic } from "@/utils";

export const Route = createFileRoute("/topics/$id/")({
  component: SingleTopic,
});

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

  const {
    data: routines,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: () => fetchRoutines(),
  });

  if (isPending) {
    return <EntityPending entity="topic" />;
  }

  if (error) {
    return <EntityError entity="topic" />;
  }

  const linkedRoutines = (routines ?? []).filter(r =>
    (r.connections ?? []).some(c => c.type === "topic" && c.id === id));

  return (
    <div>
      <PageHeader
        pageTitle={data?.name}
        pageSection="topics"
      >
        <div className="flex flex-row gap-2">
          <EntityHeaderButton
            to="/topics/$id/edit"
            params={{
              id: data?.id + "",
            }}
            label="Edit Topic"
            icon={<EditIcon />}
          />
        </div>
      </PageHeader>
      <div className="container flex flex-col gap-12">
        <InfoArea
          header="About"
          condition={!!data?.description}
        >
          <p>{data?.description}</p>
        </InfoArea>
        <InfoArea
          header="Why am I learning this?"
          condition={!!data?.reason}
        >
          <p>{data?.reason}</p>
        </InfoArea>
        <div>
          <InfoArea
            header="Domains"
            condition={!!data?.domains && data.domains.length > 0}
          >
            <DomainLinkList domains={data?.domains ?? []} />
          </InfoArea>
        </div>
        <ResourceLinksSection
          resources={data?.resources}
          resourceCount={data?.resourceCount}
        />
        <div>
          <InfoArea
            header="Routines"
            condition={linkedRoutines.length > 0}
          >
            <RoutineLinkList routines={linkedRoutines} />
          </InfoArea>
        </div>
      </div>
    </div>
  );
}
