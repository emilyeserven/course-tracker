import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/providers")({
  component: Providers,
});

export function Providers() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
