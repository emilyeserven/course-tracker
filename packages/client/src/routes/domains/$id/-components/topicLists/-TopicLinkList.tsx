import type { DomainTopic } from "@emstack/types";

import { EntityLink } from "@/components/boxElements";

/** Bulleted list of topic links with an optional course count. */
export function TopicLinkList({
  topics,
}: { topics: DomainTopic[] }) {
  return (
    <ul className="ml-5 list-disc">
      {topics.map(topic => (
        <li key={topic.id}>
          <EntityLink
            entity="topics"
            id={String(topic.id)}
            className="
              font-bold text-blue-800
              hover:text-blue-600
              dark:text-blue-300
            "
          >
            {topic.name}
          </EntityLink>
          {topic.courses && topic.courses.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({topic.courses.length}
              {" course"}
              {topic.courses.length === 1 ? "" : "s"})
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
