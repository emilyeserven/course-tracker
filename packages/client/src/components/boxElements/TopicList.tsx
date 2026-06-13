import type { Topic } from "@emstack/types";

import { Link } from "@tanstack/react-router";

import { PILL_LINK_CLASS } from "./EntityLink";

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
              from="/resources"
              params={{
                id: topic.id + "",
              }}
              className={cn(
                isPills
                  ? PILL_LINK_CLASS
                  : `
                    text-sm text-blue-800
                    hover:text-blue-600
                  `,
              )}
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
