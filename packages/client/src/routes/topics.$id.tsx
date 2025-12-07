import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/topics/$id")({
  component: SingleTopicIndex,
});

function SingleTopicIndex() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
