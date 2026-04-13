import type { Domain } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { ContentBox } from "@/components/boxes/ContentBox";
import { DomainBox } from "@/components/boxes/DomainBox";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchDomains } from "@/utils";

export const Route = createFileRoute("/domains/")({
  component: DomainsIndex,
  errorComponent: DomainsError,
  pendingComponent: DomainsPending,
});

function DomainsPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your domains...</h1>
    </div>
  );
}

function DomainsError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">
        There was an error loading your domains.
      </h1>
      <p>
        Try to use the
        {" "}
        <Link to="/onboard">Onboarding Wizard</Link>
        {" "}
        again, or
        load in properly formed data.
      </p>
    </div>
  );
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
      />
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
              if (domain.title === "") {
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
