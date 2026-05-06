import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dailies/$id")({
  component: SingleDailyIndex,
});

function SingleDailyIndex() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
