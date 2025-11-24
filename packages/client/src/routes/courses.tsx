import { createFileRoute } from "@tanstack/react-router";

import { CourseBox } from "@/components/CourseBox";

export const Route = createFileRoute("/courses")({
  component: Courses,
});

export interface Course {
  name: string;
  key: string;
  link: string;
  topic: string;
  progressCurrent?: number;
  progressTotal?: number;
  status?: "active" | "inactive" | "complete";
  dateExpires?: string;
  cost?: string;
}

export function Courses() {
  const localItem = localStorage.getItem("courseData");
  const local = JSON.parse(localItem ? localItem : "");

  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">{local.name}&#39;s Courses</h1>
      <div
        className={`
          grid grid-cols-1 gap-2
          sm:grid-cols-2
          md:grid-cols-3
        `}
      >
        {
          local.courses.map((course: Course) => {
            if (course.name === "") {
              return;
            }
            return (
              <CourseBox
                {...course}
                key={course.key}
              />
            );
          })
        }
      </div>
    </div>
  );
}
