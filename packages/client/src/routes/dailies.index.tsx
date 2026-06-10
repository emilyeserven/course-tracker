import { createFileRoute, redirect } from "@tanstack/react-router";

// Dailies were collapsed into daily-mode routines. The rich tracker now lives
// at /routines/tracker; this redirect keeps old /dailies links working.
export const Route = createFileRoute("/dailies/")({
  beforeLoad: () => {
    throw redirect({
      to: "/routines/tracker",
    });
  },
});
