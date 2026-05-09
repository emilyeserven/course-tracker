import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/courses")({
  component: Courses,
});

function Courses() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
