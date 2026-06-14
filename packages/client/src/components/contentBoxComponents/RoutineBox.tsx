import type {
  Routine,
  RoutineTodayAction,
  RoutineWeekday,
} from "@emstack/types";

import { Link } from "@tanstack/react-router";
import { AlertTriangleIcon, FlameIcon } from "lucide-react";

import { Description, EntityLink } from "@/components/boxElements";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/contentBoxComponents/ContentBox";
import { ActionableSentence } from "@/components/dailies/ActionableSentence";
import { Badge } from "@/components/ui/badge";
import { EmptyHint } from "@/components/ui/EmptyHint";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  todayAction,
}: Routine & { todayAction?: RoutineTodayAction | null }) {
  const isDaily = mode === "daily";
  // A daily routine mirrors the same entry on every weekday, so the caution
  // only applies when the grid is empty — i.e. no task, resource, or freeform
  // item is assigned at all. (connections are categorical, not the assignment.)
  const dailyHasNoAssignment
    = isDaily
      && !Object.values(weekly ?? {}).some(entry => !!entry?.id);
  const scheduledCount = weekly
    ? Object.values(weekly).filter(Boolean).length
    : 0;
  // Weekly routines schedule a different entry per weekday: show today's
  // scheduled task in place of the routine name, or a "No task for today"
  // placeholder beneath the name when today's weekday is unscheduled.
  const showNoTaskToday = !isDaily && !todayAction;
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
                  <Badge
                    key={`${c.type}:${c.id}`}
                    asChild
                    variant="secondary"
                    className="
                      bg-muted
                      hover:bg-primary hover:text-primary-foreground
                    "
                  >
                    <EntityLink
                      entity={connectionEntityKind(c.type)}
                      id={c.id}
                    >
                      {c.name ?? c.id}
                    </EntityLink>
                  </Badge>
                ))
              )
              : (
                <EmptyHint>No connections</EmptyHint>
              )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <span
              className={cn(
                "rounded-sm border px-2 py-0.5 text-xs",
                dailyHasNoAssignment
                  ? `
                    border-amber-400 bg-amber-100 text-amber-900
                    dark:border-amber-500/50 dark:bg-amber-900/40
                    dark:text-amber-100
                  `
                  : "text-muted-foreground",
              )}
              title={dailyHasNoAssignment ? "Nothing assigned" : undefined}
            >
              {isDaily ? "Daily" : "Weekly"}
            </span>
            <span
              className={cn(
                "rounded-sm px-2 py-0.5 text-xs capitalize",
                isActive
                  ? `
                    bg-green-600 text-white
                    dark:bg-green-700
                  `
                  : "bg-muted text-muted-foreground",
              )}
            >
              {status ?? "active"}
            </span>
          </div>
        </ContentBoxHeaderBar>
        <ContentBoxTitle>
          <h3 className="flex items-center gap-1.5 text-xl">
            <Link
              to="/routines/$id"
              params={{
                id,
              }}
              className="hover:text-blue-600"
            >
              {todayAction
                ? (
                  <ActionableSentence
                    prependText={todayAction.prependText}
                    appendText={todayAction.appendText}
                    name={todayAction.name}
                  />
                )
                : (
                  name
                )}
            </Link>
            {dailyHasNoAssignment && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex shrink-0 text-amber-500"
                    aria-label="Nothing assigned"
                  >
                    <AlertTriangleIcon className="size-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Nothing assigned</TooltipContent>
              </Tooltip>
            )}
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        {showNoTaskToday && <EmptyHint>No task for today</EmptyHint>}
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
                  className={
                    chain > 0 ? "text-orange-600" : "text-muted-foreground"
                  }
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
                        ? `
                          bg-blue-600 font-bold text-white
                          dark:bg-blue-700
                        `
                        : "bg-muted text-muted-foreground",
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
