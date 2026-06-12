import type { CourseProvider } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { ContentBox } from "@/components/boxes/ContentBox";
import { ProviderBox } from "@/components/boxes/ProviderBox";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { OnboardingEmptyState } from "@/components/layout/OnboardingEmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchProviders } from "@/utils";

export const Route = createFileRoute("/providers/")({
  component: Providers,
  errorComponent: ProvidersError,
  pendingComponent: ProvidersPending,
});

function ProvidersPending() {
  return <EntityPending entity="providers" />;
}

function ProvidersError() {
  return <EntityError entity="providers" />;
}

function Providers() {
  const {
    data,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  return (
    <div>
      <PageHeader
        pageTitle="Providers"
        pageSection=""
        description={ENTITY_DESCRIPTIONS.providers}
      >
        <Link
          to="/providers/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button>
            <PlusIcon className="size-4" />
            New Provider
          </Button>
        </Link>
      </PageHeader>
      <div className="container">
        <div className="card-grid">
          {(!data || data.length === 0) && (
            <OnboardingEmptyState message="No courses yet!" />
          )}

          {data
            && data.length > 0
            && data.map((provider: CourseProvider) => {
              if (provider.name === "") {
                return;
              }
              return (
                <ProviderBox
                  {...provider}
                  key={provider.id}
                />
              );
            })}

          <Link
            to="/providers/$id/edit"
            params={{
              id: "new",
            }}
          >
            <ContentBox
              className="
                h-full items-center justify-center border-dashed p-8
                text-muted-foreground transition-colors
                hover:border-solid hover:bg-accent hover:text-accent-foreground
              "
            >
              <PlusIcon size={32} />
              <span className="text-lg font-medium">Add New Provider</span>
            </ContentBox>
          </Link>
        </div>
      </div>
    </div>
  );
}
