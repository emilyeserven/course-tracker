import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/courses")({
  component: Courses,
});

export function Courses() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
