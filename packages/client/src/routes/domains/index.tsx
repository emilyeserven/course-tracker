import type { Domain } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { ContentBox, DomainBox } from "@/components/contentBoxComponents";
import {
  EntityError,
  EntityPending,
  PageHeader,
} from "@/components/listControls";
import { Button } from "@/components/ui/button";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchDomains, fetchSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

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
    queryKey: queryKeys.domains.list(),
    queryFn: () => fetchDomains(),
  });

  const {
    data: settings,
  } = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });

  const focusedIds = settings?.focusedDomainIds ?? [];
  const focusedRank = new Map(focusedIds.map((id, i) => [id, i]));
  // Focused domains first (in their saved order), then everything else in its
  // original order. A stable sort keeps non-focused domains as the API returned
  // them.
  const sortedDomains = (data ?? [])
    .map((domain, index) => ({
      domain,
      index,
    }))
    .sort((a, b) => {
      const aRank = focusedRank.get(a.domain.id ?? "");
      const bRank = focusedRank.get(b.domain.id ?? "");
      if (aRank !== undefined && bRank !== undefined) return aRank - bRank;
      if (aRank !== undefined) return -1;
      if (bRank !== undefined) return 1;
      return a.index - b.index;
    })
    .map(entry => entry.domain);

  return (
    <div>
      <PageHeader
        pageTitle="Domains"
        pageSection=""
        description={ENTITY_DESCRIPTIONS.domains}
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

          {sortedDomains.length > 0
            && sortedDomains.map((domain: Domain) => {
              if (domain.title === "" || domain.id === undefined) {
                return;
              }
              return (
                <DomainBox
                  {...domain}
                  focused={focusedRank.has(domain.id)}
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
