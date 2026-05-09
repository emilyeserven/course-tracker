import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, RadarIcon } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { Button } from "@/components/ui/button";
import { fetchDomains } from "@/utils";

export function DashboardRadars() {
  const {
    data: domains, isPending, error,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  const sortedDomains = (domains ?? [])
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title, undefined, {
      sensitivity: "base",
    }));

  return (
    <DashboardCard
      title="Radars"
      action={(
        <Link
          to="/domains"
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
        <p className="text-sm text-muted-foreground">Loading radars...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">Failed to load radars.</p>
      )}
      {domains && sortedDomains.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No radars yet.</i>
        </p>
      )}
      {sortedDomains.length > 0 && (
        <ul className="flex flex-col divide-y">
          {sortedDomains.map(domain => (
            <li
              key={domain.id}
              className="flex flex-row items-center gap-2 py-2"
            >
              <Link
                to="/domains/$id/radar"
                params={{
                  id: domain.id,
                }}
                className="
                  inline-flex items-center gap-2 font-medium
                  hover:text-blue-600
                "
              >
                <RadarIcon className="size-4 text-muted-foreground" />
                {domain.title}
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className="
                    inline-flex items-center gap-1 text-xs text-muted-foreground
                  "
                  title={`${domain.topicCount ?? 0} topic${
                    domain.topicCount === 1 ? "" : "s"
                  }`}
                >
                  {domain.topicCount ?? 0}
                </span>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                >
                  <Link
                    to="/domains/$id/radar"
                    params={{
                      id: domain.id,
                    }}
                  >
                    Go
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
