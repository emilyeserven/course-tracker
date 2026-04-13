import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/domains/$id")({
  component: SingleDomainLayout,
});

function SingleDomainLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
