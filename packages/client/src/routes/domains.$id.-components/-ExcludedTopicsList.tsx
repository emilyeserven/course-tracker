import type { DomainExcludedTopic } from "@emstack/types";

import { Link } from "@tanstack/react-router";

/** Bulleted list of topics excluded from the radar, each with an optional reason. */
export function ExcludedTopicsList({
  topics,
}: { topics: DomainExcludedTopic[] }) {
  return (
    <ul className="ml-5 flex list-disc flex-col gap-1">
      {topics.map(topic => (
        <li key={topic.id}>
          <Link
            to="/topics/$id"
            params={{
              id: topic.id,
            }}
            className={`
              font-bold text-blue-800
              hover:text-blue-600
            `}
          >
            {topic.name}
          </Link>
          {topic.reason && (
            <span className="ml-2 text-sm text-muted-foreground">
              — {topic.reason}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
