import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
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
              className="flex flex-col gap-1 py-2"
            >
              <div className="flex flex-row items-center gap-2">
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
                {course.progressTotal > 0 && (
                  <div className="flex flex-row items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {course.progressCurrent}
                      {" / "}
                      {course.progressTotal}
                    </span>
                    <RadialProgress
                      current={course.progressCurrent}
                      total={course.progressTotal}
                      size={20}
                    />
                  </div>
                )}
                {!!course.url && (
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto pl-6"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      Go to Course
                      <ExternalLink />
                    </Button>
                  </a>
                )}
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
