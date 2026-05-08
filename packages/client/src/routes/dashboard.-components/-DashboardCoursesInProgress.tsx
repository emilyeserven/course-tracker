import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { Button } from "@/components/ui/button";
import { RadialProgress } from "@/components/ui/RadialProgress";
import { fetchCourses } from "@/utils";

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

export function DashboardCoursesInProgress() {
  const {
    data: courses, isPending, error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const inProgress = (courses ?? []).filter(c => c.status === "active");

  return (
    <DashboardCard
      title="Courses in Progress"
      action={(
        <Link
          to="/courses"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      )}
    >
      {isPending && (
        <p className="text-sm text-muted-foreground">Loading courses...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">Failed to load courses.</p>
      )}
      {courses && inProgress.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No courses in progress.</i>
        </p>
      )}
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
                to="/courses/$id"
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
