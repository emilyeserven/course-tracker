import type { TopicForTopicsPage } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { ContentBox } from "@/components/boxes/ContentBox";
import { TopicBox } from "@/components/boxes/TopicBox";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { FilterOptionCount } from "@/components/FilterOptionCount";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDomains, fetchTopics } from "@/utils";

type SortOption = "alpha-asc" | "alpha-desc" | "resources";

export const Route = createFileRoute("/topics/")({
  component: Topics,
  errorComponent: TopicsError,
  pendingComponent: TopicsPending,
});

function TopicsPending() {
  return <EntityPending entity="topics" />;
}

function TopicsError() {
  return <EntityError entity="topics" />;
}

function sortTopics(
  topics: TopicForTopicsPage[],
  sortBy: SortOption,
): TopicForTopicsPage[] {
  return [...topics].sort((a, b) => {
    switch (sortBy) {
      case "alpha-asc":
        return a.name.localeCompare(b.name);
      case "alpha-desc":
        return b.name.localeCompare(a.name);
      case "resources":
        return (b.courseCount ?? 0) - (a.courseCount ?? 0);
    }
  });
}

function Topics() {
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>("alpha-asc");

  const {
    data,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: domains,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  const filteredAndSorted = useMemo(() => {
    if (!data) return [];

    let result = data.filter(t => t.name !== "");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const nameMatch = t.name.toLowerCase().includes(q);
        const domainMatch = t.domains?.some(d =>
          d.title.toLowerCase().includes(q));
        return nameMatch || domainMatch;
      });
    }

    if (filterDomain === "none") {
      result = result.filter(t => !t.domains || t.domains.length === 0);
    }
    else if (filterDomain) {
      result = result.filter(t =>
        t.domains?.some(d => d.id === filterDomain));
    }

    return sortTopics(result, sortBy);
  }, [data, search, filterDomain, sortBy]);

  const hasActiveFilters = filterDomain;

  const totalTopicCount = useMemo(
    () => data?.filter(t => t.name !== "").length ?? 0,
    [data],
  );
  const noDomainCount = useMemo(
    () =>
      data?.filter(
        t => t.name !== "" && (!t.domains || t.domains.length === 0),
      ).length ?? 0,
    [data],
  );

  return (
    <div>
      <PageHeader
        pageTitle="Topics"
        pageSection=""
      />
      <div className="container flex flex-col gap-4">
        <div>
          {data && data.length > 0 && (
            <div
              className="mb-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <SearchIcon
                    className="
                      absolute top-1/2 left-2.5 size-4 -translate-y-1/2
                      text-muted-foreground
                    "
                  />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="
                      h-9 rounded-md border border-input bg-transparent pr-3
                      pl-8 text-sm shadow-xs transition-[color,box-shadow]
                      outline-none
                      placeholder:text-muted-foreground
                      focus-visible:border-ring focus-visible:ring-[3px]
                      focus-visible:ring-ring/50
                    "
                  />
                </div>

                <Select
                  value={filterDomain ?? "all"}
                  onValueChange={v =>
                    setFilterDomain(v === "all" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span>All Domains</span>
                      <FilterOptionCount count={totalTopicCount} />
                    </SelectItem>
                    <SelectItem value="none">
                      <span>No Domain</span>
                      <FilterOptionCount count={noDomainCount} />
                    </SelectItem>
                    {domains?.map(d => (
                      <SelectItem
                        key={d.id}
                        value={d.id}
                      >
                        <span>{d.title}</span>
                        <FilterOptionCount count={d.topicCount ?? 0} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterDomain(undefined);
                    }}
                  >
                    <XIcon className="size-4" />
                    Clear filters
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort</span>
                <Select
                  value={sortBy}
                  onValueChange={v => setSortBy(v as SortOption)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha-asc">A-Z</SelectItem>
                    <SelectItem value="alpha-desc">Z-A</SelectItem>
                    <SelectItem value="resources">
                      Number of linked resources
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
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

          {filteredAndSorted.length > 0
            && filteredAndSorted.map((topic: TopicForTopicsPage) => {
              return (
                <TopicBox
                  {...topic}
                  key={topic.id}
                />
              );
            })}

          {data && data.length > 0 && filteredAndSorted.length === 0 && (
            <div className="text-muted-foreground">
              <i>No topics match your filters.</i>
            </div>
          )}

          <Link
            to="/topics/$id/edit"
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
              <span className="text-lg font-medium">Add New Topic</span>
            </ContentBox>
          </Link>
        </div>
      </div>
    </div>
  );
}
