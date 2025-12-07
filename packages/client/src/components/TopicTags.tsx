import type { Topic } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";

interface TopicTagsProps {
  topics: Topic[] | undefined;
}

export function TopicTags({
  topics,
}: TopicTagsProps) {
  if (!topics) {
    return <></>;
  }
  return (
    <>
      {topics && topics.map((topic) => {
        if (!topic) {
          return <></>;
        }
        return (
          <Link
            to="/topics/$id"
            from="/courses"
            params={{
              id: topic.id + "",
            }}
            className={`
              rounded bg-gray-50 px-2 py-0.5 text-xs
              hover:bg-gray-900 hover:text-white
            `}
            key={topic.id}
          >
            {topic.name}
          </Link>
        );
      })}
    </>
  );
}
