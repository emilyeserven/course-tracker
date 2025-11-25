import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getCourse } from "@/utils/getCourse";

export const Route = createFileRoute("/courses/$id")({
  loader: async ({
    params,
  }) => {
    return getCourse(params.id);
  },
  component: SingleCourseIndex,
});

function SingleCourseIndex() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
