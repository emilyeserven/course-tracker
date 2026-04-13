import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/domains")({
  component: Domains,
});

export function Domains() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
