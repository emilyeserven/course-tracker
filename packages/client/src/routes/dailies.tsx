import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dailies")({
  component: Dailies,
});

export function Dailies() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
