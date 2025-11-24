import type { Course } from "@/routes/courses";

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { getCourse } from "@/utils/getCourse";

export const Route = createFileRoute("/courses/$id")({
  loader: async ({
    params,
  }) => {
    return getCourse(params.id);
  },
  component: SingleCourse,
});

export function SingleCourse() {
  const data: Course = Route.useLoaderData();
  console.log("data", data);
  return (
    <div>
      <Link
        to="/courses"
        className="mb-8 flex flex-row"
      >
        <ArrowLeft />
        {" "}
        Courses
      </Link>
      <span className="mb-4 text-lg">COURSE</span>
      <h1 className="mb-4 text-3xl">{data.name}</h1>
    </div>
  );
}
