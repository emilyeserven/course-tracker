import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/routines/$id")({
  component: SingleRoutineIndex,
});

function SingleRoutineIndex() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
