import type { Routine, RoutineWeekday } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import { FlameIcon } from "lucide-react";

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
import {
  connectionEntityKind,
  getCurrentChain,
  getTotalCompletedDays,
} from "@/utils";

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
  connections,
  status,
  weekly,
  mode,
  completions,
}: Routine) {
  const isDaily = mode === "daily";
  const scheduledCount = weekly
    ? Object.values(weekly).filter(Boolean).length
    : 0;
  const isActive = status === "active";
  const chain = getCurrentChain({
    completions: completions ?? [],
  });
  const totalDays = getTotalCompletedDays({
    completions: completions ?? [],
  });

  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar>
          <div className="flex flex-row flex-wrap items-center gap-2">
            {connections && connections.length > 0
              ? (
                connections.map(c => (
                  <EntityLink
                    key={`${c.type}:${c.id}`}
                    entity={connectionEntityKind(c.type)}
                    id={c.id}
                    className={`
                      rounded-sm bg-gray-50 px-2 py-0.5 text-xs
                      hover:bg-gray-900 hover:text-white
                    `}
                  >
                    {c.name ?? c.id}
                  </EntityLink>
                ))
              )
              : (
                <span className="text-xs text-muted-foreground italic">
                  No connections
                </span>
              )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <span
              className="
                rounded-sm border px-2 py-0.5 text-xs text-muted-foreground
              "
            >
              {isDaily ? "Daily" : "Weekly"}
            </span>
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
          </div>
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
        {isDaily
          ? (
            <div className="flex flex-row items-center gap-4 text-xs">
              <span
                className="inline-flex items-center gap-1"
                title="Current day chain"
              >
                <FlameIcon
                  size={14}
                  className={chain > 0
                    ? "text-orange-600"
                    : "text-muted-foreground"}
                />
                <strong>{chain}</strong>
                <span className="text-muted-foreground">chain</span>
              </span>
              <span
                className="inline-flex items-center gap-1"
                title="Total completed days"
              >
                <strong>{totalDays}</strong>
                <span className="text-muted-foreground">total days</span>
              </span>
            </div>
          )
          : (
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
                      `
                        flex size-5 items-center justify-center rounded-full
                        text-xs
                      `,
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
          )}
      </ContentBoxFooter>
    </ContentBox>
  );
}
