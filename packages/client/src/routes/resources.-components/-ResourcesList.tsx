import type {
  CourseProvider,
  ResourceInResources,
  TopicForTopicsPage,
} from "@emstack/types";

import { useMemo, useState } from "react";

import { Link } from "@tanstack/react-router";
import { ArrowDownAZIcon, ArrowUpAZIcon, PlusIcon } from "lucide-react";

import {
  ContentBox,
  CourseBox,
  CoursesTable,
} from "@/components/contentBoxComponents";
import {
  ClearFiltersButton,
  FilterSelect,
  ListSearchInput,
  OnboardingEmptyState,
  ViewModeToggle,
} from "@/components/listControls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStoredViewMode } from "@/hooks/useStoredViewMode";

type SortOption = "alpha" | "progress" | "provider" | "topic";

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

export interface ResourcesListProps {
  resources: ResourceInResources[];
  providers: CourseProvider[];
  topics: TopicForTopicsPage[];
  initialTopicId?: string;
}

export function ResourcesList({
  resources,
  providers,
  topics,
  initialTopicId,
}: ResourcesListProps) {
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState<string | undefined>();
  const [filterTopic, setFilterTopic] = useState<string | undefined>(
    initialTopicId,
  );
  const [sortBy, setSortBy] = useState<SortOption>("alpha");
  const [sortAsc, setSortAsc] = useState(true);
  const {
    viewMode, setViewMode: updateViewMode,
  } = useStoredViewMode(
    "resources:viewMode",
    {
      legacyKey: "courses:viewMode",
    },
  );

  const filteredAndSorted = useMemo(() => {
    let result = resources;

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
  }, [resources, search, filterProvider, filterTopic, sortBy, sortAsc]);

  const hasActiveFilters = filterProvider || filterTopic;

  const totalCourseCount = resources.length;
  const noProviderCount = useMemo(
    () => resources.filter(c => !c.provider).length,
    [resources],
  );
  const noTopicCount = useMemo(
    () => resources.filter(c => !c.topics || c.topics.length === 0).length,
    [resources],
  );

  return (
    <div className="container flex flex-col gap-4">
      <div>
        {resources.length > 0 && (
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
                options={providers
                  .filter(p => (p.resourceCount ?? 0) > 0)
                  .map(p => ({
                    value: p.id,
                    label: p.name,
                    count: p.resourceCount ?? 0,
                  }))}
              />

              <FilterSelect
                placeholder="Topic"
                value={filterTopic}
                onChange={setFilterTopic}
                allLabel="All Topics"
                totalCount={totalCourseCount}
                noneLabel="No Topic"
                noneCount={noTopicCount}
                options={topics
                  .filter(t => (t.resourceCount ?? 0) > 0)
                  .map(t => ({
                    value: t.id,
                    label: t.name,
                    count: t.resourceCount ?? 0,
                  }))}
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
              <ViewModeToggle
                viewMode={viewMode}
                onChange={updateViewMode}
                gridLabel="Grid view"
              />
            </div>
          </div>
        )}
      </div>
      {resources.length === 0 && (
        <OnboardingEmptyState message="No resources yet!" />
      )}

      {resources.length > 0 && filteredAndSorted.length === 0 && (
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
                hover:border-solid hover:bg-accent hover:text-accent-foreground
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
  );
}
