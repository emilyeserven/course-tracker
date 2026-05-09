import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/domains/$id/radar/edit")({
  beforeLoad: ({
    params,
  }) => {
    throw redirect({
      to: "/domains/$id/edit",
      params: {
        id: params.id,
      },
      search: {
        tab: "blips" as const,
      },
    });
  },
});
