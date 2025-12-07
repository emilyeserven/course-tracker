import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/topics")({
  component: Topics,
});

export function Topics() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
