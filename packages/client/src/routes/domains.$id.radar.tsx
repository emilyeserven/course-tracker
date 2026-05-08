import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/domains/$id/radar")({
  component: RadarLayout,
});

function RadarLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
