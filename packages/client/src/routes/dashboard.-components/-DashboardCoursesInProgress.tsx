import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { Button } from "@/components/ui/button";
import { RadialProgress } from "@/components/ui/RadialProgress";
import { fetchCourses } from "@/utils";

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
                  <span className="group relative inline-flex items-center">
                    <RadialProgress
                      current={course.progressCurrent}
                      total={course.progressTotal}
                      size={20}
                    />
                    <span
                      className="
                        pointer-events-none invisible absolute top-full left-1/2
                        z-10 mt-1 -translate-x-1/2 rounded-sm bg-popover px-1.5
                        py-0.5 text-xs whitespace-nowrap text-popover-foreground
                        shadow-md
                        group-hover:visible
                      "
                    >
                      {course.progressCurrent}
                      {" / "}
                      {course.progressTotal}
                    </span>
                  </span>
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
