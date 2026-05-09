import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/domains")({
  component: Domains,
});

function Domains() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
