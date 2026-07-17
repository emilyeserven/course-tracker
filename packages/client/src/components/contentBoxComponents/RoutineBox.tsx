import type { Routine, RoutineTodayAction } from "@emstack/types";

import { Link } from "@tanstack/react-router";
import { AlertTriangleIcon } from "lucide-react";

import { Description } from "@/components/boxElements";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/contentBoxComponents/ContentBox";
import { ActionableSentence } from "@/components/dailies/ActionableSentence";
import {
  RoutineConnectionBadges,
  RoutineDayStrip,
  RoutineStreakStats,
} from "@/components/routines";
import { EmptyHint } from "@/components/ui/EmptyHint";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
    = isDaily && !Object.values(weekly ?? {}).some(entry => !!entry?.id);
  // Weekly routines schedule a different entry per weekday: show today's
  // scheduled task in place of the routine name, or a "No task for today"
  // placeholder beneath the name when today's weekday is unscheduled.
  const showNoTaskToday = !isDaily && !todayAction;
  const isActive = status === "active";

  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar>
          <div className="flex flex-row flex-wrap items-center gap-2">
            <RoutineConnectionBadges connections={connections} />
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
        <RoutineDayStrip weekly={weekly} />
        <RoutineStreakStats completions={completions} />
      </ContentBoxFooter>
    </ContentBox>
  );
}
