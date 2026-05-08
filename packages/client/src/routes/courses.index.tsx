import type { CourseInCourses } from "@emstack/types/src";

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
  SearchIcon,
  XIcon,
} from "lucide-react";

import { ContentBox } from "@/components/boxes/ContentBox";
import { CourseBox } from "@/components/boxes/CourseBox";
import { CoursesTable } from "@/components/boxes/CoursesTable";
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
import { fetchCourses, fetchProviders, fetchTopics } from "@/utils";

type SortOption = "alpha" | "progress" | "provider" | "topic";
type ViewMode = "grid" | "table";

const VIEW_MODE_STORAGE_KEY = "courses:viewMode";

function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid";
  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return stored === "table" ? "table" : "grid";
}

export const Route = createFileRoute("/courses/")({
  component: Courses,
  errorComponent: CoursesError,
  pendingComponent: CoursesPending,
});

function CoursesPending() {
  return <EntityPending entity="courses" />;
}

function CoursesError() {
  return <EntityError entity="courses" />;
}

function getProgressPercent(course: CourseInCourses): number {
  if (course.progressTotal === 0) return 0;
  return course.progressCurrent / course.progressTotal;
}

function sortCourses(
  courses: CourseInCourses[],
  sortBy: SortOption,
): CourseInCourses[] {
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
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState<string | undefined>();
  const [filterTopic, setFilterTopic] = useState<string | undefined>();
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
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
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
        pageTitle="Your Courses"
        pageSection=""
      >
        <Link
          to="/courses/$id/edit"
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
                <div className="relative">
                  <SearchIcon
                    className="
                      absolute top-1/2 left-2.5 size-4 -translate-y-1/2
                      text-muted-foreground
                    "
                  />
                  <input
                    type="text"
                    placeholder="Search courses..."
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
                  value={filterProvider ?? "all"}
                  onValueChange={v =>
                    setFilterProvider(v === "all" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span>All Providers</span>
                      <FilterOptionCount count={totalCourseCount} />
                    </SelectItem>
                    <SelectItem value="none">
                      <span>No Provider</span>
                      <FilterOptionCount count={noProviderCount} />
                    </SelectItem>
                    {providers?.map(p => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                      >
                        <span>{p.name}</span>
                        <FilterOptionCount count={p.courseCount ?? 0} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterTopic ?? "all"}
                  onValueChange={v =>
                    setFilterTopic(v === "all" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span>All Topics</span>
                      <FilterOptionCount count={totalCourseCount} />
                    </SelectItem>
                    <SelectItem value="none">
                      <span>No Topic</span>
                      <FilterOptionCount count={noTopicCount} />
                    </SelectItem>
                    {topics?.map(t => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                      >
                        <span>{t.name}</span>
                        <FilterOptionCount count={t.courseCount ?? 0} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterProvider(undefined);
                      setFilterTopic(undefined);
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

        {data && data.length > 0 && filteredAndSorted.length === 0 && (
          <div className="text-muted-foreground">
            <i>No courses match your filters.</i>
          </div>
        )}

        {viewMode === "grid" && (
          <div className="card-grid">
            {filteredAndSorted.length > 0
              && filteredAndSorted.map((course: CourseInCourses) => {
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
              to="/courses/$id/edit"
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
                <span className="text-lg font-medium">Add New Course</span>
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
                to="/courses/$id/edit"
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
