import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EditIcon, ExternalLink } from "lucide-react";

import {
  InfoArea,
  InfoRow,
  ResourceLinksSection,
  YesNoDisplay,
} from "@/components/infoCard";
import { EntityHeaderButton, PageHeader } from "@/components/layout";
import { EntityError, EntityPending } from "@/components/listControls/EntityStates";
import { Button } from "@/components/ui/button";
import { fetchSingleProvider } from "@/utils";

export const Route = createFileRoute("/providers/$id/")({
  component: SingleProviders,
});

function SingleProviders() {
  const {
    id,
  } = Route.useParams();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["provider", id],
    queryFn: () => fetchSingleProvider(id),
  });

  if (isPending) {
    return <EntityPending entity="provider" />;
  }

  if (error) {
    return <EntityError entity="provider" />;
  }

  return (
    <div>
      <PageHeader
        pageTitle={data?.name}
        pageSection="providers"
      >
        <div className="flex flex-row gap-2">
          {!!data?.url && (
            <a
              href={data?.url}
              target="_blank"
              rel="noreferrer"
            >
              <Button>
                Go to Platform
                <ExternalLink />
              </Button>
            </a>
          )}
          <EntityHeaderButton
            to="/providers/$id/edit"
            params={{
              id: data?.id + "",
            }}
            label="Edit Provider"
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
        <InfoRow header="Money Things">
          <InfoArea
            header="Resource Cost"
            condition={!!data?.cost}
          >
            <p>${data?.cost}</p>
          </InfoArea>
          <InfoArea header="Fees Shared BTW Courses?">
            <YesNoDisplay value={!!data?.isCourseFeesShared} />
          </InfoArea>
          <InfoArea
            header="Re-Up Date"
            condition={!!data?.recurDate}
          >
            {data?.recurDate}
          </InfoArea>

          <InfoArea
            header="Subscription Recurrance"
            condition={!!data?.recurPeriodUnit}
          >
            <span className="first-letter:uppercase">
              {data?.recurPeriodUnit
                && `Every ${data?.recurPeriod ? data.recurPeriod : ""} ${data.recurPeriodUnit}`}
            </span>
          </InfoArea>
        </InfoRow>
        <ResourceLinksSection
          resources={data?.resources}
          resourceCount={data?.resourceCount}
        />
      </div>
    </div>
  );
}
