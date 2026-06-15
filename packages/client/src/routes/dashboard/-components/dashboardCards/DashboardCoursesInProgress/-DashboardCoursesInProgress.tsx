import type { DashboardTileProps } from "@/lib/dashboardTiles";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import {
  Button,
  CardSettingsFlyout,
  DashboardCard,
  DashboardSectionStatus,
  isAutoHeight,
  Popover,
  PopoverContent,
  PopoverTrigger,
  queryKeys,
  RadialProgress,
} from "../DashboardCard/-cardKit";

import { fetchDailies, fetchResources } from "@/utils";

function ProgressIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        type="button"
        aria-label={`Progress: ${current} of ${total}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center"
      >
        <RadialProgress
          current={current}
          total={total}
          size={20}
        />
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={6}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-auto px-2 py-1 text-xs whitespace-nowrap"
      >
        {current}
        {" / "}
        {total}
      </PopoverContent>
    </Popover>
  );
}

export function DashboardCoursesInProgress({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const {
    data: courses, isPending, error,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });
  const {
    data: dailies,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
  });

  const courseIdsWithActiveDaily = new Set(
    (dailies ?? [])
      .filter(d => d.status !== "complete" && d.status !== "paused")
      .map(d => d.resource?.id)
      .filter((id): id is string => Boolean(id)),
  );

  const inProgress = (courses ?? []).filter(
    c => c.status === "active" && !courseIdsWithActiveDaily.has(c.id),
  );

  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title="Resources in Progress"
      action={(
        <Link
          to="/resources"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      )}
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        />
      )}
    >
      <DashboardSectionStatus
        isPending={isPending}
        error={error}
        isEmpty={!!courses && inProgress.length === 0}
        entity="courses"
        emptyMessage="No courses in progress."
      />
      {inProgress.length > 0 && (
        <ul className="flex flex-col divide-y">
          {inProgress.map(course => (
            <li
              key={course.id}
              className="flex flex-row items-center gap-2 py-2"
            >
              {course.progressTotal > 0
                ? (
                  <ProgressIndicator
                    current={course.progressCurrent}
                    total={course.progressTotal}
                  />
                )
                : <span className="size-5" />}
              <Link
                to="/resources/$id"
                params={{
                  id: course.id,
                }}
                className="
                  font-medium
                  hover:text-blue-600
                "
              >
                {course.name}
              </Link>
              {!!course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto"
                >
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    Go
                    <ExternalLink />
                  </Button>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
