import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/courses/$id")({
  component: SingleCourseIndex,
});

function SingleCourseIndex() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
