import type { ResourceInResources, CourseProvider } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  ExternalLink,
} from "lucide-react";

import {
  DashboardCard,
  DashboardSectionStatus,
} from "@/components/boxes/DashboardCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { fetchResources, fetchProviders } from "@/utils";

type ViewMode = "courses" | "providers";

type CourseSortKey = "name" | "costPerUnit";
type ProviderSortKey = "name" | "costPerUnit";
type SortDir = "asc" | "desc";

interface CourseRow {
  resource: ResourceInResources;
  effectiveCost: number;
  progressCurrent: number;
  progressTotal: number;
  progressFraction: number;
  costPerUnit: number | null;
  isUnstarted: boolean;
}

interface ProviderRow {
  provider: CourseProvider;
  courseCount: number;
  completedUnits: number;
  totalUnits: number;
  cost: number;
  costPerUnit: number | null;
}

function parseCost(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function buildCourseRows(courses: ResourceInResources[] | undefined): CourseRow[] {
  if (!courses) return [];
  return courses.map((course) => {
    const rawCost = parseCost(course.cost?.cost);
    const splitBy
      = course.cost?.splitBy && course.cost.splitBy > 0 ? course.cost.splitBy : 1;
    const effectiveCost = rawCost / splitBy;
    const progressCurrent = course.progressCurrent ?? 0;
    const progressTotal = course.progressTotal ?? 0;
    const progressFraction
      = progressTotal > 0 ? progressCurrent / progressTotal : 0;
    const percentComplete
      = progressTotal > 0
        ? Number(((progressCurrent / progressTotal) * 100).toFixed(2))
        : 0;
    const costPerUnit = percentComplete > 0 ? rawCost / percentComplete : null;
    return {
      resource: course,
      effectiveCost,
      progressCurrent,
      progressTotal,
      progressFraction,
      costPerUnit,
      isUnstarted: progressCurrent === 0,
    };
  });
}

function buildProviderRows(
  providers: CourseProvider[] | undefined,
  courses: ResourceInResources[] | undefined,
): ProviderRow[] {
  if (!providers || !courses) return [];
  const sharedFeeProviders = providers.filter(
    p => p.isCourseFeesShared === true,
  );
  return sharedFeeProviders.map((provider) => {
    const providerCourses = courses.filter(
      c => c.provider?.id === provider.id,
    );
    const completedUnits = providerCourses.reduce(
      (sum, c) => sum + (c.progressCurrent ?? 0),
      0,
    );
    const totalUnits = providerCourses.reduce(
      (sum, c) => sum + (c.progressTotal ?? 0),
      0,
    );
    const cost = parseCost(provider.cost);
    const costPerUnit
      = totalUnits > 0 ? (completedUnits / totalUnits) * cost : null;
    return {
      provider,
      courseCount: providerCourses.length,
      completedUnits,
      totalUnits,
      cost,
      costPerUnit,
    };
  });
}

function compareCourseRows(
  a: CourseRow,
  b: CourseRow,
  key: CourseSortKey,
  dir: SortDir,
): number {
  const direction = dir === "asc" ? 1 : -1;
  let av: number | string;
  let bv: number | string;
  switch (key) {
    case "name":
      av = a.resource.name.toLowerCase();
      bv = b.resource.name.toLowerCase();
      break;
    case "costPerUnit":
    default:
      // Treat unstarted (null) as the highest cost-per-unit.
      av = a.costPerUnit ?? Number.POSITIVE_INFINITY;
      bv = b.costPerUnit ?? Number.POSITIVE_INFINITY;
      break;
  }
  if (av < bv) return -1 * direction;
  if (av > bv) return 1 * direction;
  return a.resource.name.localeCompare(b.resource.name);
}

function compareProviderRows(
  a: ProviderRow,
  b: ProviderRow,
  key: ProviderSortKey,
  dir: SortDir,
): number {
  const direction = dir === "asc" ? 1 : -1;
  let av: number | string;
  let bv: number | string;
  switch (key) {
    case "name":
      av = a.provider.name.toLowerCase();
      bv = b.provider.name.toLowerCase();
      break;
    case "costPerUnit":
    default:
      av = a.costPerUnit ?? Number.POSITIVE_INFINITY;
      bv = b.costPerUnit ?? Number.POSITIVE_INFINITY;
      break;
  }
  if (av < bv) return -1 * direction;
  if (av > bv) return 1 * direction;
  return a.provider.name.localeCompare(b.provider.name);
}

export function DashboardCoursesByAmortization() {
  const {
    data: courses,
    isPending: isCoursesPending,
    error: coursesError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchResources(),
  });

  const {
    data: providers,
    isPending: isProvidersPending,
    error: providersError,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const [viewMode, setViewMode] = useState<ViewMode>("courses");
  const [showUnstarted, setShowUnstarted] = useState(false);
  const [courseSortKey, setCourseSortKey]
    = useState<CourseSortKey>("costPerUnit");
  const [courseSortDir, setCourseSortDir] = useState<SortDir>("desc");
  const [providerSortKey, setProviderSortKey]
    = useState<ProviderSortKey>("costPerUnit");
  const [providerSortDir, setProviderSortDir] = useState<SortDir>("desc");

  function toggleCourseSort(key: CourseSortKey) {
    if (courseSortKey !== key) {
      setCourseSortKey(key);
      setCourseSortDir(key === "name" ? "asc" : "desc");
      return;
    }
    setCourseSortDir(prev => (prev === "asc" ? "desc" : "asc"));
  }

  function toggleProviderSort(key: ProviderSortKey) {
    if (providerSortKey !== key) {
      setProviderSortKey(key);
      setProviderSortDir(key === "name" ? "asc" : "desc");
      return;
    }
    setProviderSortDir(prev => (prev === "asc" ? "desc" : "asc"));
  }

  function courseSortIcon(key: CourseSortKey) {
    if (courseSortKey !== key) {
      return <ChevronsUpDownIcon className="size-3 opacity-50" />;
    }
    return courseSortDir === "asc"
      ? (
        <ChevronUpIcon className="size-3" />
      )
      : (
        <ChevronDownIcon className="size-3" />
      );
  }

  function providerSortIcon(key: ProviderSortKey) {
    if (providerSortKey !== key) {
      return <ChevronsUpDownIcon className="size-3 opacity-50" />;
    }
    return providerSortDir === "asc"
      ? (
        <ChevronUpIcon className="size-3" />
      )
      : (
        <ChevronDownIcon className="size-3" />
      );
  }

  const courseRows = useMemo(() => {
    const all = buildCourseRows(courses);
    const filtered = showUnstarted ? all : all.filter(r => !r.isUnstarted);
    return filtered
      .slice()
      .sort((a, b) => compareCourseRows(a, b, courseSortKey, courseSortDir));
  }, [courses, showUnstarted, courseSortKey, courseSortDir]);

  const providerRows = useMemo(() => {
    const all = buildProviderRows(providers, courses);
    return all
      .slice()
      .sort((a, b) =>
        compareProviderRows(a, b, providerSortKey, providerSortDir));
  }, [providers, courses, providerSortKey, providerSortDir]);

  const isPending
    = viewMode === "providers"
      ? isCoursesPending || isProvidersPending
      : isCoursesPending;
  const error
    = viewMode === "providers" ? coursesError ?? providersError : coursesError;
  const hasData
    = viewMode === "providers"
      ? providers !== undefined && courses !== undefined
      : courses !== undefined;
  const isEmpty
    = viewMode === "providers" ? providerRows.length === 0 : courseRows.length === 0;

  return (
    <DashboardCard
      title="Cost per Unit"
      action={
        <Link
          to="/resources"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      }
    >
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-3"
      >
        <Tabs
          value={viewMode}
          onValueChange={v => setViewMode(v as ViewMode)}
        >
          <TabsList className="h-8">
            <TabsTrigger
              value="courses"
              className="text-xs"
            >
              Courses
            </TabsTrigger>
            <TabsTrigger
              value="providers"
              className="text-xs"
            >
              Providers
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {viewMode === "courses" && (
          <button
            type="button"
            role="switch"
            aria-checked={showUnstarted}
            onClick={() => setShowUnstarted(prev => !prev)}
            className="
              inline-flex items-center gap-2 text-xs text-muted-foreground
              hover:text-foreground
            "
          >
            <span
              className={cn(
                `
                  relative inline-flex h-4 w-7 items-center rounded-full
                  transition-colors
                `,
                showUnstarted ? "bg-primary" : "bg-input",
              )}
            >
              <span
                className={cn(
                  `
                    inline-block size-3 rounded-full bg-background shadow-sm
                    transition-transform
                  `,
                  showUnstarted ? "translate-x-3.5" : "translate-x-0.5",
                )}
              />
            </span>
            Show unstarted
          </button>
        )}
      </div>
      <DashboardSectionStatus
        isPending={isPending}
        error={error}
        isEmpty={hasData && isEmpty}
        entity={viewMode === "providers" ? "providers" : "courses"}
        emptyMessage={viewMode === "providers"
          ? "No providers with shared course fees."
          : "No courses to show."}
      />
      {viewMode === "courses" && courseRows.length > 0 && (
        <div
          className="max-h-80 w-full overflow-auto [scrollbar-width:thin]"
        >
          <Table className="w-auto min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleCourseSort("name")}
                    className="
                      inline-flex items-center gap-1
                      hover:text-foreground
                    "
                  >
                    Course
                    {courseSortIcon("name")}
                  </button>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleCourseSort("costPerUnit")}
                    className="
                      inline-flex items-center gap-1
                      hover:text-foreground
                    "
                  >
                    Cost per Unit
                    {courseSortIcon("costPerUnit")}
                  </button>
                </TableHead>
                <TableHead
                  className="text-right whitespace-nowrap"
                  aria-label="Go"
                >
                  <span className="sr-only">Go</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseRows.map(
                ({
                  resource: course,
                  effectiveCost,
                  progressCurrent,
                  progressTotal,
                  costPerUnit,
                  isUnstarted,
                }) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <Link
                        to="/resources/$id"
                        params={{
                          id: course.id,
                        }}
                        className="hover:text-blue-600"
                      >
                        {course.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Popover>
                        <PopoverTrigger
                          className={cn(
                            `
                              cursor-pointer underline-offset-2
                              hover:underline
                            `,
                            isUnstarted && "text-muted-foreground",
                          )}
                        >
                          {costPerUnit === null
                            ? "—"
                            : formatCurrency(costPerUnit)}
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="w-56"
                        >
                          <dl
                            className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm"
                          >
                            <dt className="text-muted-foreground">Cost</dt>
                            <dd className="text-right font-medium tabular-nums">
                              {formatCurrency(effectiveCost)}
                            </dd>
                            <dt className="text-muted-foreground">Progress</dt>
                            <dd className="text-right font-medium tabular-nums">
                              {progressTotal > 0
                                ? `${progressCurrent} / ${progressTotal}`
                                : progressCurrent}
                            </dd>
                            {isUnstarted && (
                              <dd
                                className="
                                  col-span-2 text-xs text-muted-foreground
                                "
                              >
                                Unstarted — no progress yet
                              </dd>
                            )}
                          </dl>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {course.url
                        ? (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                          >
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Go
                              <ExternalLink />
                            </a>
                          </Button>
                        )
                        : (
                          <span className="text-muted-foreground">—</span>
                        )}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {viewMode === "providers" && providerRows.length > 0 && (
        <div
          className="max-h-80 w-full overflow-auto [scrollbar-width:thin]"
        >
          <Table className="w-auto min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleProviderSort("name")}
                    className="
                      inline-flex items-center gap-1
                      hover:text-foreground
                    "
                  >
                    Provider
                    {providerSortIcon("name")}
                  </button>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleProviderSort("costPerUnit")}
                    className="
                      inline-flex items-center gap-1
                      hover:text-foreground
                    "
                  >
                    Cost per Unit
                    {providerSortIcon("costPerUnit")}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providerRows.map(
                ({
                  provider,
                  courseCount,
                  completedUnits,
                  totalUnits,
                  cost,
                  costPerUnit,
                }) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <Link
                        to="/providers/$id"
                        params={{
                          id: provider.id,
                        }}
                        className="hover:text-blue-600"
                      >
                        {provider.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Popover>
                        <PopoverTrigger
                          className={cn(
                            `
                              cursor-pointer underline-offset-2
                              hover:underline
                            `,
                            costPerUnit === null && "text-muted-foreground",
                          )}
                        >
                          {costPerUnit === null
                            ? "—"
                            : formatCurrency(costPerUnit)}
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="w-56"
                        >
                          <dl
                            className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm"
                          >
                            <dt className="text-muted-foreground">Courses</dt>
                            <dd className="text-right font-medium tabular-nums">
                              {courseCount}
                            </dd>
                            <dt className="text-muted-foreground">
                              Completed Units
                            </dt>
                            <dd className="text-right font-medium tabular-nums">
                              {completedUnits}
                            </dd>
                            <dt className="text-muted-foreground">
                              Total Units
                            </dt>
                            <dd className="text-right font-medium tabular-nums">
                              {totalUnits}
                            </dd>
                            <dt className="text-muted-foreground">Cost</dt>
                            <dd className="text-right font-medium tabular-nums">
                              {formatCurrency(cost)}
                            </dd>
                            {costPerUnit === null && (
                              <dd
                                className="
                                  col-span-2 text-xs text-muted-foreground
                                "
                              >
                                No course progress yet
                              </dd>
                            )}
                          </dl>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardCard>
  );
}
