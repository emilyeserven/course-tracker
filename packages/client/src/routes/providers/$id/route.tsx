import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/providers/$id")({
  component: SingleProvidersIndex,
});

function SingleProvidersIndex() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
