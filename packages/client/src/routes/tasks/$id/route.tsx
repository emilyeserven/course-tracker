import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks/$id")({
  component: SingleTaskIndex,
});

function SingleTaskIndex() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
