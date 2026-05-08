import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookIcon } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { fetchTopics } from "@/utils";

export function DashboardTopics() {
  const {
    data: topics, isPending, error,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const sorted = (topics ?? [])
    .slice()
    .sort((a, b) => (b.courseCount ?? 0) - (a.courseCount ?? 0));

  return (
    <DashboardCard
      title="Topics"
      action={(
        <Link
          to="/topics"
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
        <p className="text-sm text-muted-foreground">Loading topics...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">Failed to load topics.</p>
      )}
      {topics && sorted.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No topics yet.</i>
        </p>
      )}
      {sorted.length > 0 && (
        <ul className="flex flex-col divide-y">
          {sorted.map(topic => (
            <li
              key={topic.id}
              className="flex flex-row items-center gap-2 py-2"
            >
              <Link
                to="/topics/$id"
                params={{
                  id: topic.id,
                }}
                className="
                  font-medium
                  hover:text-blue-600
                "
              >
                {topic.name}
              </Link>
              <span
                className="
                  ml-auto inline-flex items-center gap-1 text-xs
                  text-muted-foreground
                "
                title={`${topic.courseCount ?? 0} course${
                  topic.courseCount === 1 ? "" : "s"
                }`}
              >
                <BookIcon className="size-3.5" />
                {topic.courseCount ?? 0}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
