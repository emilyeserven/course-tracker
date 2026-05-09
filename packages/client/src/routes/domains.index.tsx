import type { Domain } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { ContentBox } from "@/components/boxes/ContentBox";
import { DomainBox } from "@/components/boxes/DomainBox";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchDomains } from "@/utils";

export const Route = createFileRoute("/domains/")({
  component: DomainsIndex,
  errorComponent: DomainsError,
  pendingComponent: DomainsPending,
});

function DomainsPending() {
  return <EntityPending entity="domains" />;
}

function DomainsError() {
  return <EntityError entity="domains" />;
}

function DomainsIndex() {
  const {
    data,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  return (
    <div>
      <PageHeader
        pageTitle="Domains"
        pageSection=""
      >
        <Link
          to="/domains/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button>
            <PlusIcon className="size-4" />
            New Domain
          </Button>
        </Link>
      </PageHeader>
      <div className="container">
        <div className="card-grid">
          {(!data || data.length === 0) && (
            <div className="flex flex-col gap-6">
              <i>No domains yet!</i>

              <Link
                to="/domains/$id/edit"
                params={{
                  id: "new",
                }}
              >
                <Button>
                  Create your first domain
                  {" "}
                  <ArrowRightIcon />
                </Button>
              </Link>
            </div>
          )}

          {data
            && data.length > 0
            && data.map((domain: Domain) => {
              if (domain.title === "" || domain.id === undefined) {
                return;
              }
              return (
                <DomainBox
                  {...domain}
                  key={domain.id}
                />
              );
            })}

          <Link
            to="/domains/$id/edit"
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
              <span className="text-lg font-medium">Add New Domain</span>
            </ContentBox>
          </Link>
        </div>
      </div>
    </div>
  );
}
