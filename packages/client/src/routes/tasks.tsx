import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks")({
  component: Tasks,
});

function Tasks() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
