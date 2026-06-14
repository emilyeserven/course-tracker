import { createFileRoute, redirect } from "@tanstack/react-router";

// Daily editing now happens on the unified routine edit form.
export const Route = createFileRoute("/dailies/$id/edit")({
  beforeLoad: ({
    params,
  }) => {
    throw redirect({
      to: "/routines/$id/edit",
      params: {
        id: params.id,
      },
    });
  },
});
