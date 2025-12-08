import type { Topic } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

interface TopicListProps {
  topics: Topic[] | undefined;
  isPills?: boolean;
}

export function TopicList({
  topics,
  isPills = true,
}: TopicListProps) {
  if (!topics) {
    return <></>;
  }
  return (
    <div className="flex flex-row items-center gap-2">
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
            className={cn({
              "rounded bg-gray-50 px-2 py-0.5 text-xs hover:bg-gray-900 hover:text-white": isPills,
            })}
            key={topic.id}
          >
            {topic.name}
          </Link>
        );
      })}
    </div>
  );
}
