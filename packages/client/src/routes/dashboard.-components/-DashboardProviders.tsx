import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookIcon } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { fetchProviders } from "@/utils";

export function DashboardProviders() {
  const {
    data: providers, isPending, error,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const sorted = (providers ?? [])
    .slice()
    .sort((a, b) => (b.courseCount ?? 0) - (a.courseCount ?? 0));

  return (
    <DashboardCard
      title="Providers"
      action={(
        <Link
          to="/providers"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      )}
    >
      {isPending && (
        <p className="text-sm text-muted-foreground">Loading providers...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">Failed to load providers.</p>
      )}
      {providers && sorted.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No providers yet.</i>
        </p>
      )}
      {sorted.length > 0 && (
        <ul className="flex flex-col divide-y">
          {sorted.map(provider => (
            <li
              key={provider.id}
              className="flex flex-row items-center gap-2 py-2"
            >
              <Link
                to="/providers/$id"
                params={{
                  id: provider.id,
                }}
                className="
                  font-medium
                  hover:text-blue-600
                "
              >
                {provider.name}
              </Link>
              <span
                className="
                  ml-auto inline-flex items-center gap-1 text-xs
                  text-muted-foreground
                "
                title={`${provider.courseCount ?? 0} course${
                  provider.courseCount === 1 ? "" : "s"
                }`}
              >
                <BookIcon className="size-3.5" />
                {provider.courseCount ?? 0}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
