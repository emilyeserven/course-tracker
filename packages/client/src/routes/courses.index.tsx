import { createFileRoute, Link } from "@tanstack/react-router";

import { CourseBox } from "@/components/CourseBox";

export const Route = createFileRoute("/courses/")({
  component: Courses,
  errorComponent: CoursesError,
  pendingComponent: CoursesPending,
});

function CoursesPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your courses...</h1>
    </div>
  );
}

function CoursesError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading your courses.</h1>
      <p>
        Try to use the
        {" "}
        <Link to="/onboard">Onboarding Wizard</Link>
        {" "}
        again, or load in properly formed course data.
      </p>
    </div>
  );
}

export interface Course {
  name: string;
  id: string;
  link: string;
  topic: string;
  service?: string;
  description?: string;
  progressCurrent?: number;
  progressTotal?: number;
  status?: "active" | "inactive" | "complete";
  dateExpires?: string;
  cost?: string;
}

function Courses() {
  const localItem = localStorage.getItem("courseData");
  const local = JSON.parse(localItem ? localItem : "");

  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">{local.name}&#39;s Courses</h1>
      <div
        className={`
          grid grid-cols-1 gap-4 gap-y-6
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
                key={course.id}
              />
            );
          })
        }
      </div>
    </div>
  );
}
