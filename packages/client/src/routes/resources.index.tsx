import type { ResourceInResources } from "@emstack/types";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownAZIcon,
  ArrowRightIcon,
  ArrowUpAZIcon,
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
} from "lucide-react";

import { ContentBox } from "@/components/boxes/ContentBox";
import { CourseBox } from "@/components/boxes/CourseBox";
import { CoursesTable } from "@/components/boxes/CoursesTable";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  ClearFiltersButton,
  FilterSelect,
  ListSearchInput,
} from "@/components/ListPageControls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchResources, fetchProviders, fetchTopics } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

type SortOption = "alpha" | "progress" | "provider" | "topic";
type ViewMode = "grid" | "table";

const VIEW_MODE_STORAGE_KEY = "resources:viewMode";
// Pre-rename key; fall back to it so existing preferences survive.
const LEGACY_VIEW_MODE_STORAGE_KEY = "courses:viewMode";

function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid";
  const stored
    = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
      ?? window.localStorage.getItem(LEGACY_VIEW_MODE_STORAGE_KEY);
  return stored === "table" ? "table" : "grid";
}

export interface ResourcesSearch {
  topicId?: string;
}

export const Route = createFileRoute("/resources/")({
  component: Courses,
  errorComponent: CoursesError,
  pendingComponent: CoursesPending,
  validateSearch: (search: Record<string, unknown>): ResourcesSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
  }),
});

function CoursesPending() {
  return <EntityPending entity="resources" />;
}

function CoursesError() {
  return <EntityError entity="resources" />;
}

function getProgressPercent(course: ResourceInResources): number {
  if (course.progressTotal === 0) return 0;
  return course.progressCurrent / course.progressTotal;
}

function sortCourses(
  courses: ResourceInResources[],
  sortBy: SortOption,
): ResourceInResources[] {
  return [...courses].sort((a, b) => {
    switch (sortBy) {
      case "alpha":
        return a.name.localeCompare(b.name);
      case "progress":
        return getProgressPercent(b) - getProgressPercent(a);
      case "provider":
        return (a.provider?.name ?? "").localeCompare(b.provider?.name ?? "");
      case "topic":
        return (a.topics?.[0]?.name ?? "").localeCompare(
          b.topics?.[0]?.name ?? "",
        );
    }
  });
}

function Courses() {
  const urlSearch = Route.useSearch();
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState<string | undefined>();
  const [filterTopic, setFilterTopic] = useState<string | undefined>(
    urlSearch.topicId,
  );
  const [sortBy, setSortBy] = useState<SortOption>("alpha");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    }
  };

  const {
    data,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });

  const {
    data: providers,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const filteredAndSorted = useMemo(() => {
    if (!data) return [];

    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    if (filterProvider === "none") {
      result = result.filter(c => !c.provider);
    }
    else if (filterProvider) {
      result = result.filter(c => c.provider?.id === filterProvider);
    }

    if (filterTopic === "none") {
      result = result.filter(c => !c.topics || c.topics.length === 0);
    }
    else if (filterTopic) {
      result = result.filter(c =>
        c.topics?.some(t => t.id === filterTopic));
    }

    const sorted = sortCourses(result, sortBy);
    return sortAsc ? sorted : sorted.reverse();
  }, [data, search, filterProvider, filterTopic, sortBy, sortAsc]);

  const hasActiveFilters = filterProvider || filterTopic;

  const totalCourseCount = data?.length ?? 0;
  const noProviderCount = useMemo(
    () => data?.filter(c => !c.provider).length ?? 0,
    [data],
  );
  const noTopicCount = useMemo(
    () => data?.filter(c => !c.topics || c.topics.length === 0).length ?? 0,
    [data],
  );

  return (
    <div>
      <PageHeader
        pageTitle="Your Resources"
        pageSection=""
        description={ENTITY_DESCRIPTIONS.resources}
      >
        <Link
          to="/resources/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button>
            <PlusIcon className="size-4" />
            New Course
          </Button>
        </Link>
      </PageHeader>
      <div className="container flex flex-col gap-4">
        <div>
          {data && data.length > 0 && (
            <div
              className="mb-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex flex-wrap items-center gap-3">
                <ListSearchInput
                  placeholder="Search resources..."
                  value={search}
                  onChange={setSearch}
                />
                <FilterSelect
                  placeholder="Provider"
                  value={filterProvider}
                  onChange={setFilterProvider}
                  allLabel="All Providers"
                  totalCount={totalCourseCount}
                  noneLabel="No Provider"
                  noneCount={noProviderCount}
                  options={
                    providers
                      ?.filter(p => (p.resourceCount ?? 0) > 0)
                      .map(p => ({
                        value: p.id,
                        label: p.name,
                        count: p.resourceCount ?? 0,
                      })) ?? []
                  }
                />

                <FilterSelect
                  placeholder="Topic"
                  value={filterTopic}
                  onChange={setFilterTopic}
                  allLabel="All Topics"
                  totalCount={totalCourseCount}
                  noneLabel="No Topic"
                  noneCount={noTopicCount}
                  options={
                    topics
                      ?.filter(t => (t.resourceCount ?? 0) > 0)
                      .map(t => ({
                        value: t.id,
                        label: t.name,
                        count: t.resourceCount ?? 0,
                      })) ?? []
                  }
                />

                {hasActiveFilters && (
                  <ClearFiltersButton
                    onClick={() => {
                      setFilterProvider(undefined);
                      setFilterTopic(undefined);
                    }}
                  />
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
                    <SelectItem value="alpha">A-Z</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="topic">Topic</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSortAsc(prev => !prev)}
                >
                  {sortAsc
                    ? (
                      <ArrowDownAZIcon className="size-4" />
                    )
                    : (
                      <ArrowUpAZIcon className="size-4" />
                    )}
                </Button>
                <div
                  className="
                    ml-2 flex items-center rounded-md border border-input
                    bg-transparent
                  "
                  role="group"
                  aria-label="View mode"
                >
                  <Button
                    type="button"
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                    onClick={() => updateViewMode("grid")}
                  >
                    <LayoutGridIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="icon"
                    aria-label="Table view"
                    aria-pressed={viewMode === "table"}
                    onClick={() => updateViewMode("table")}
                  >
                    <ListIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {(!data || data.length === 0) && (
          <div className="flex flex-col gap-6">
            <i>No resources yet!</i>

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

        {data && data.length > 0 && filteredAndSorted.length === 0 && (
          <div className="text-muted-foreground">
            <i>No resources match your filters.</i>
          </div>
        )}

        {viewMode === "grid" && (
          <div className="card-grid">
            {filteredAndSorted.length > 0
              && filteredAndSorted.map((course: ResourceInResources) => {
                if (!course) {
                  return <></>;
                }
                return (
                  <CourseBox
                    {...course}
                    key={course.id}
                  />
                );
              })}

            <Link
              to="/resources/$id/edit"
              params={{
                id: "new",
              }}
            >
              <ContentBox
                className="
                  h-full items-center justify-center border-dashed p-8
                  text-muted-foreground transition-colors
                  hover:border-solid hover:bg-accent
                  hover:text-accent-foreground
                "
              >
                <PlusIcon size={32} />
                <span className="text-lg font-medium">Add New Resource</span>
              </ContentBox>
            </Link>
          </div>
        )}

        {viewMode === "table" && (
          <div className="flex flex-col gap-4">
            {filteredAndSorted.length > 0 && (
              <CoursesTable courses={filteredAndSorted} />
            )}
            <div>
              <Link
                to="/resources/$id/edit"
                params={{
                  id: "new",
                }}
              >
                <Button variant="outline">
                  <PlusIcon className="size-4" />
                  Add New Course
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
