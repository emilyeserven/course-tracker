import type { CourseProvider } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { ContentBox } from "@/components/boxes/ContentBox";
import { ProviderBox } from "@/components/boxes/ProviderBox";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
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
            <div className="flex flex-col gap-6">
              <i>No courses yet!</i>

              <Link
                to="/onboard"
                className=""
              >
                <Button>
                  Go to onboarding
                  {" "}
                  <ArrowRightIcon />
                </Button>
              </Link>
            </div>
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
                text-muted-foreground
                hover:bg-accent hover:text-accent-foreground
                h-full items-center justify-center border-dashed p-8
                transition-colors
                hover:border-solid
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
