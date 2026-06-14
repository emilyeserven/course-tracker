import { createFileRoute, redirect } from "@tanstack/react-router";

// A daily migrated into a routine with the same id, so old /dailies/$id links
// resolve to the equivalent routine.
export const Route = createFileRoute("/dailies/$id/")({
  beforeLoad: ({
    params,
  }) => {
    throw redirect({
      to: "/routines/$id",
      params: {
        id: params.id,
      },
    });
  },
});
