import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/resources")({
  component: Resources,
});

function Resources() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
