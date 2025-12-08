import type { Course } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/button";
import { CourseBox } from "@/components/CourseBox";
import { PageHeader } from "@/components/PageHeader";
import { fetchCourses } from "@/utils/fetchFunctions";

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

function Courses() {
  const localItem = localStorage.getItem("courseData");
  const local = JSON.parse(localItem ? localItem : "");

  const {
    data,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  return (
    <div>
      <div className="mb-4 bg-gray-200 py-6">
        <div className="container">
          <PageHeader
            pageTitle={`${local.name}'s Courses`}
            pageSection=""
          />
        </div>
      </div>
      <div className="container">
        <div
          className={`
            grid grid-cols-1 gap-4 gap-y-6
            sm:grid-cols-2
            md:grid-cols-3
          `}
        >
          {(!data || data.length === 0) && (
            <div className="flex flex-col gap-6">
              <i>No courses yet!</i>

              <Link
                to="/onboard"
                className=""
              >
                <Button>
                  Go to onboarding
                  {" "}
                  <ArrowRightIcon />
                </Button>
              </Link>
            </div>
          )}

          {
            data && data.length > 0 && data.map((course: Course) => {
              if (!course) {
                return <></>;
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
    </div>
  );
}
