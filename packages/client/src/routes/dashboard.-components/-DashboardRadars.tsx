import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { RadarIcon } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { fetchDomains } from "@/utils";

export function DashboardRadars() {
  const {
    data: domains, isPending, error,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  const withRadars = (domains ?? [])
    .filter(d => d.hasRadar)
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
            text-primary text-sm underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      )}
    >
      {isPending && (
        <p className="text-muted-foreground text-sm">Loading radars...</p>
      )}
      {error && (
        <p className="text-destructive text-sm">Failed to load radars.</p>
      )}
      {domains && withRadars.length === 0 && (
        <p className="text-muted-foreground text-sm">
          <i>No radars yet.</i>
        </p>
      )}
      {withRadars.length > 0 && (
        <ul className="flex flex-col divide-y">
          {withRadars.map(domain => (
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
                <RadarIcon className="text-muted-foreground size-4" />
                {domain.title}
              </Link>
              <span
                className="
                  text-muted-foreground ml-auto inline-flex items-center gap-1
                  text-xs
                "
                title={`${domain.topicCount ?? 0} topic${
                  domain.topicCount === 1 ? "" : "s"
                }`}
              >
                {domain.topicCount ?? 0}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
