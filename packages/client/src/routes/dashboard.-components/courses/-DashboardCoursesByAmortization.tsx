import type { SortKey, ViewMode } from "./-amortizationRows";
import type { SortDirection } from "@/components/ui/manualSort";
import type { DashboardTileProps } from "@/lib/dashboardTiles";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { courseColumns, providerColumns } from "./-amortizationColumns";
import {
  buildCourseRows,
  buildProviderRows,
  compareCourseRows,
  compareProviderRows,
} from "./-amortizationRows";
import {
  CardSettingsFlyout,
  cn,
  DashboardCard,
  DashboardSectionStatus,
  isAutoHeight,
  queryKeys,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../shared/-cardKit";

import { DataTable } from "@/components/ui/data-table";
import {
  makeManualSortHandler,
  toSortingState,
} from "@/components/ui/manualSort";
import { fetchProviders, fetchResources } from "@/utils";

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
  const [providerSortKey, setProviderSortKey]
    = useState<SortKey>("costPerUnit");
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
    = viewMode === "providers" ? (coursesError ?? providersError) : coursesError;
  const hasData
    = viewMode === "providers"
      ? providers !== undefined && courses !== undefined
      : courses !== undefined;
  const isEmpty
    = viewMode === "providers"
      ? providerRows.length === 0
      : courseRows.length === 0;

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
        emptyMessage={
          viewMode === "providers"
            ? "No providers with shared course fees."
            : "No courses to show."
        }
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
