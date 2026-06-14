import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/topics")({
  component: Topics,
});

function Topics() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
