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
    <div
      className={cn("flex flex-row items-center", {
        "gap-2": isPills,
        "gap-1": !isPills,
      })}
    >
      {topics && topics.map((topic, i) => {
        if (!topic) {
          return <></>;
        }
        return (
          <span
            key={topic.id}
            className="flex flex-row items-center"
          >
            <Link
              to="/topics/$id"
              from="/courses"
              params={{
                id: topic.id + "",
              }}
              className={cn({
                "rounded bg-gray-50 px-2 py-0.5 text-xs hover:bg-gray-900 hover:text-white": isPills,
                "text-sm text-blue-800 hover:text-blue-600": !isPills,
              })}
              key={topic.id}
            >
              {topic.name}
            </Link>
            {!isPills && i !== topics.length - 1 && ", "}
          </span>
        );
      })}
    </div>
  );
}
