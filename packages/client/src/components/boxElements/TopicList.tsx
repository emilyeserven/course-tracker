import type { Topic } from "@emstack/types";

import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
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
        const link = (
          <Link
            to="/topics/$id"
            from="/resources"
            params={{
              id: topic.id + "",
            }}
            className={cn(!isPills && `
              text-sm text-blue-800
              hover:text-blue-600
              dark:text-blue-300
            `)}
          >
            {topic.name}
          </Link>
        );
        return (
          <span
            key={topic.id}
            className="flex flex-row items-center"
          >
            {isPills
              ? (
                <Badge
                  asChild
                  variant="secondary"
                  className="
                    bg-muted
                    hover:bg-primary hover:text-primary-foreground
                  "
                >
                  {link}
                </Badge>
              )
              : link}
            {!isPills && i !== topics.length - 1 && ", "}
          </span>
        );
      })}
    </div>
  );
}
