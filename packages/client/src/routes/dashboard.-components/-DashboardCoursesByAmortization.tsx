import type { DashboardTileProps } from "./-dashboardTileMeta";
import type { SortDirection } from "@/components/ui/manualSort";
import type { ResourceInResources, CourseProvider } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { CardSettingsFlyout } from "./-DashboardCardSettings";
import { isAutoHeight } from "./-dashboardTileMeta";

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
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { EmptyDash } from "@/components/ui/EmptyDash";
import { makeManualSortHandler, toSortingState } from "@/components/ui/manualSort";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  fetchProviders,
  fetchResources,
  formatCurrency,
  parseCost,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

type ViewMode = "courses" | "providers";

type SortKey = "name" | "costPerUnit";

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

/**
 * Compare two amortization rows by name or cost-per-unit (unstarted rows, with
 * a null cost-per-unit, sort highest), honoring sort direction and falling back
 * to name order on ties. `getName` adapts this to the course vs provider shape.
 */
function compareAmortizationRows<T extends { costPerUnit: number | null }>(
  a: T,
  b: T,
  key: SortKey,
  dir: SortDirection,
  getName: (row: T) => string,
): number {
  const direction = dir === "asc" ? 1 : -1;
  let av: number | string;
  let bv: number | string;
  switch (key) {
    case "name":
      av = getName(a).toLowerCase();
      bv = getName(b).toLowerCase();
      break;
    case "costPerUnit":
    default:
      av = a.costPerUnit ?? Number.POSITIVE_INFINITY;
      bv = b.costPerUnit ?? Number.POSITIVE_INFINITY;
      break;
  }
  if (av < bv) return -1 * direction;
  if (av > bv) return 1 * direction;
  return getName(a).localeCompare(getName(b));
}

function compareCourseRows(
  a: CourseRow,
  b: CourseRow,
  key: SortKey,
  dir: SortDirection,
): number {
  return compareAmortizationRows(a, b, key, dir, row => row.resource.name);
}

function compareProviderRows(
  a: ProviderRow,
  b: ProviderRow,
  key: SortKey,
  dir: SortDirection,
): number {
  return compareAmortizationRows(a, b, key, dir, row => row.provider.name);
}

const courseColumns: ColumnDef<CourseRow>[] = [
  {
    id: "name",
    // name sorts ascending on first click, cost-per-unit descending.
    sortDescFirst: false,
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Course"
      />
    ),
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "font-medium whitespace-nowrap",
    },
    cell: ({
      row,
    }) => (
      <Link
        to="/resources/$id"
        params={{
          id: row.original.resource.id,
        }}
        className="hover:text-blue-600"
      >
        {row.original.resource.name}
      </Link>
    ),
  },
  {
    id: "costPerUnit",
    sortDescFirst: true,
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Cost per Unit"
        align="right"
      />
    ),
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => {
      const {
        effectiveCost,
        progressCurrent,
        progressTotal,
        costPerUnit,
        isUnstarted,
      } = row.original;
      return (
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
            {costPerUnit === null ? "—" : formatCurrency(costPerUnit)}
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56"
          >
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
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
                <dd className="col-span-2 text-xs text-muted-foreground">
                  Unstarted — no progress yet
                </dd>
              )}
            </dl>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    id: "go",
    enableSorting: false,
    header: () => <span className="sr-only">Go</span>,
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) =>
      row.original.resource.url
        ? (
          <Button
            asChild
            size="sm"
            variant="outline"
          >
            <a
              href={row.original.resource.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Go
              <ExternalLink />
            </a>
          </Button>
        )
        : (
          <EmptyDash />
        ),
  },
];

const providerColumns: ColumnDef<ProviderRow>[] = [
  {
    id: "name",
    sortDescFirst: false,
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Provider"
      />
    ),
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "font-medium whitespace-nowrap",
    },
    cell: ({
      row,
    }) => (
      <Link
        to="/providers/$id"
        params={{
          id: row.original.provider.id,
        }}
        className="hover:text-blue-600"
      >
        {row.original.provider.name}
      </Link>
    ),
  },
  {
    id: "costPerUnit",
    sortDescFirst: true,
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Cost per Unit"
        align="right"
      />
    ),
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => {
      const {
        courseCount,
        completedUnits,
        totalUnits,
        cost,
        costPerUnit,
      } = row.original;
      return (
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
            {costPerUnit === null ? "—" : formatCurrency(costPerUnit)}
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56"
          >
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Courses</dt>
              <dd className="text-right font-medium tabular-nums">
                {courseCount}
              </dd>
              <dt className="text-muted-foreground">Completed Units</dt>
              <dd className="text-right font-medium tabular-nums">
                {completedUnits}
              </dd>
              <dt className="text-muted-foreground">Total Units</dt>
              <dd className="text-right font-medium tabular-nums">
                {totalUnits}
              </dd>
              <dt className="text-muted-foreground">Cost</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatCurrency(cost)}
              </dd>
              {costPerUnit === null && (
                <dd className="col-span-2 text-xs text-muted-foreground">
                  No course progress yet
                </dd>
              )}
            </dl>
          </PopoverContent>
        </Popover>
      );
    },
  },
];

export function DashboardCoursesByAmortization({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const {
    data: courses,
    isPending: isCoursesPending,
    error: coursesError,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
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
  const [courseSortKey, setCourseSortKey] = useState<SortKey>("costPerUnit");
  const [courseSortDir, setCourseSortDir] = useState<SortDirection>("desc");
  const [providerSortKey, setProviderSortKey] = useState<SortKey>("costPerUnit");
  const [providerSortDir, setProviderSortDir] = useState<SortDirection>("desc");

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

  const courseSorting = toSortingState(courseSortKey, courseSortDir);
  const providerSorting = toSortingState(providerSortKey, providerSortDir);

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
      autoHeight={isAutoHeight(tile)}
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
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        />
      )}
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
        <DataTable
          columns={courseColumns}
          data={courseRows}
          getRowId={row => row.resource.id}
          manualSorting
          sorting={courseSorting}
          onSortingChange={makeManualSortHandler(courseSorting, (id, dir) => {
            setCourseSortKey(id as SortKey);
            setCourseSortDir(dir);
          })}
          className="w-auto min-w-full"
          containerClassName="max-h-80 w-full overflow-auto [scrollbar-width:thin]"
        />
      )}
      {viewMode === "providers" && providerRows.length > 0 && (
        <DataTable
          columns={providerColumns}
          data={providerRows}
          getRowId={row => row.provider.id}
          manualSorting
          sorting={providerSorting}
          onSortingChange={makeManualSortHandler(providerSorting, (id, dir) => {
            setProviderSortKey(id as SortKey);
            setProviderSortDir(dir);
          })}
          className="w-auto min-w-full"
          containerClassName="max-h-80 w-full overflow-auto [scrollbar-width:thin]"
        />
      )}
    </DashboardCard>
  );
}
