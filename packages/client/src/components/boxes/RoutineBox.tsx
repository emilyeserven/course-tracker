import type { Routine, RoutineWeekday } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";

import { Description } from "@/components/boxElements/Description";
import { EntityLink } from "@/components/boxElements/EntityLink";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/boxes/ContentBox";
import { cn } from "@/lib/utils";

// Monday-first display order with single-letter labels.
const DAY_STRIP: { day: RoutineWeekday;
  letter: string; }[] = [
  {
    day: "1",
    letter: "M",
  },
  {
    day: "2",
    letter: "T",
  },
  {
    day: "3",
    letter: "W",
  },
  {
    day: "4",
    letter: "T",
  },
  {
    day: "5",
    letter: "F",
  },
  {
    day: "6",
    letter: "S",
  },
  {
    day: "0",
    letter: "S",
  },
];

export function RoutineBox({
  id,
  name,
  description,
  topic,
  status,
  weekly,
}: Routine) {
  const scheduledCount = weekly
    ? Object.values(weekly).filter(Boolean).length
    : 0;
  const isActive = status === "active";

  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar>
          <div className="flex flex-row items-center gap-2">
            {topic
              ? (
                <EntityLink
                  entity="topics"
                  id={topic.id}
                  className={`
                    rounded-sm bg-gray-50 px-2 py-0.5 text-xs
                    hover:bg-gray-900 hover:text-white
                  `}
                >
                  {topic.name}
                </EntityLink>
              )
              : (
                <span className="text-xs text-muted-foreground italic">
                  No topic
                </span>
              )}
          </div>
          <span
            className={cn(
              "rounded-sm px-2 py-0.5 text-xs capitalize",
              isActive
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700",
            )}
          >
            {status ?? "active"}
          </span>
        </ContentBoxHeaderBar>
        <ContentBoxTitle>
          <h3 className="text-xl">
            <Link
              to="/routines/$id"
              params={{
                id,
              }}
              className="hover:text-blue-600"
            >
              {name}
            </Link>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <Description description={description} />
      </ContentBoxBody>
      <ContentBoxFooter>
        <div
          className="flex flex-row gap-1"
          title={`${scheduledCount} day${scheduledCount === 1 ? "" : "s"} scheduled`}
        >
          {DAY_STRIP.map(({
            day, letter,
          }, index) => {
            const scheduled = !!weekly?.[day];
            return (
              <span
                key={`${day}-${index}`}
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs",
                  scheduled
                    ? "bg-blue-600 font-bold text-white"
                    : "bg-gray-100 text-gray-400",
                )}
              >
                {letter}
              </span>
            );
          })}
        </div>
      </ContentBoxFooter>
    </ContentBox>
  );
}
