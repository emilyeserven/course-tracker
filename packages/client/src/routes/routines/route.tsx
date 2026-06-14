import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/routines")({
  component: Routines,
});

function Routines() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
