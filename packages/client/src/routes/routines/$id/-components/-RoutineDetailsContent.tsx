import type { Routine } from "@emstack/types";

import { FlameIcon, LaughIcon } from "lucide-react";

import { RoutineConnectionsList } from "./-RoutineConnectionsList";
import { RoutineScheduleEntryList } from "./-RoutineScheduleEntryList";

import { InfoArea } from "@/components/layout";
import {
  curatedDateRange,
  DAY_LABELS,
  DAY_ORDER,
  formatCuratedDateLabel,
} from "@/components/routines";
import { useTaskResourceNames } from "@/hooks/useTaskResourceNames";
import {
  getCurrentChain,
  getTodayKey,
  getTotalCompletedDays,
} from "@/utils";

interface RoutineDetailsContentProps {
  data: Routine;
}

/**
 * The Details tab body for a routine: Type / Status / Stats tiles, connected
 * entities, and (for weekly routines) the day-by-day schedule.
 */
export function RoutineDetailsContent({
  data,
}: RoutineDetailsContentProps) {
  const {
    taskNames,
  } = useTaskResourceNames();

  const weekly = data.weekly ?? {};
  const isDaily = data.mode === "daily";
  const isCurated = data.mode === "curated";
  // Full window of dates this curated run spans (today → end date); empty for the
  // other modes, or when no end date is set / it has already passed.
  const curatedDates = isCurated
    ? curatedDateRange(getTodayKey(), data.curated?.endDate)
    : [];
  const completions = data.completions ?? [];
  const chain = getCurrentChain({
    completions,
  });
  const total = getTotalCompletedDays({
    completions,
  });

  return (
    <div className="flex flex-col gap-12">
      <div
        className="
          grid grid-cols-1 gap-12
          md:grid-cols-4
        "
      >
        <InfoArea
          header="Type"
          condition={true}
        >
          <span
            className="
              inline-flex items-center rounded-full px-2.5 py-0.5 text-xs
              font-medium
            "
          >
            {isCurated ? "Curated" : isDaily ? "Daily Task" : "Weekly Schedule"}
          </span>
        </InfoArea>
        <InfoArea
          header="Status"
          condition={true}
        >
          <span className="capitalize">{data.status ?? "active"}</span>
        </InfoArea>
        <div className="md:col-span-2">
          <InfoArea
            header="Stats"
            condition={true}
          >
            <div className="flex flex-row flex-wrap gap-6 text-sm">
              <span className="inline-flex items-center gap-1">
                <FlameIcon
                  size={16}
                  className={
                    chain > 0 ? "text-orange-600" : "text-muted-foreground"
                  }
                />
                <strong>{chain}</strong>
                <span className="text-muted-foreground">day chain</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <LaughIcon
                  size={16}
                  className={
                    total > 0 ? "text-emerald-600" : "text-muted-foreground"
                  }
                />
                <strong>{total}</strong>
                <span className="text-muted-foreground">total days</span>
              </span>
            </div>
          </InfoArea>
        </div>
      </div>
      <InfoArea
        header="Connected To"
        condition={(data.connections?.length ?? 0) > 0}
      >
        <RoutineConnectionsList connections={data.connections ?? []} />
      </InfoArea>
      {!isDaily && !isCurated && (
        <InfoArea
          header="Weekly Schedule"
          condition={true}
        >
          <RoutineScheduleEntryList
            rows={DAY_ORDER.map(day => ({
              key: day,
              label: DAY_LABELS[day],
              entry: weekly[day],
            }))}
            taskNames={taskNames}
            gridClass="grid grid-cols-[120px_1fr]"
          />
        </InfoArea>
      )}
      {isCurated && (
        <InfoArea
          header="Curated Schedule"
          condition={true}
        >
          {data.curated?.endDate && (
            <p className="mb-2 text-sm text-muted-foreground">
              Ends {formatCuratedDateLabel(data.curated.endDate)}
            </p>
          )}
          {curatedDates.length > 0
            ? (
              <RoutineScheduleEntryList
                rows={curatedDates.map(dateKey => ({
                  key: dateKey,
                  label: formatCuratedDateLabel(dateKey),
                  entry: data.curated?.entries?.[dateKey],
                }))}
                taskNames={taskNames}
                gridClass="grid grid-cols-[150px_1fr]"
              />
            )
            : (
              <span className="text-sm text-muted-foreground italic">
                No curated schedule set.
              </span>
            )}
        </InfoArea>
      )}
    </div>
  );
}
