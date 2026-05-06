import type { CourseInCourses } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fetchCourses } from "@/utils";

function isInProgress(course: CourseInCourses): boolean {
  if (course.status !== "active") return false;
  if (!course.progressTotal || course.progressTotal === 0) return false;
  return course.progressCurrent > 0
    && course.progressCurrent < course.progressTotal;
}

export function DashboardCoursesInProgress() {
  const {
    data: courses, isPending, error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const inProgress = (courses ?? []).filter(isInProgress);

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
              className="flex flex-col gap-1 py-2"
            >
              <div className="flex flex-row items-center justify-between gap-2">
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
                <span className="text-xs text-muted-foreground">
                  {course.progressCurrent}
                  {" / "}
                  {course.progressTotal}
                </span>
              </div>
              <ProgressBar
                progressCurrent={course.progressCurrent}
                progressTotal={course.progressTotal}
                status={course.status}
                className="mt-0"
              />
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
