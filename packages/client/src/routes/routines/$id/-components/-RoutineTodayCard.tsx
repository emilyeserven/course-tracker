import type { Daily, Routine } from "@emstack/types";

import { ExternalLink } from "lucide-react";

import { DashboardCard } from "@/components/contentBoxComponents/DashboardCard";
import { TodayStatusCell } from "@/components/dailies";
import { RoutineEntryLabel } from "@/components/routines";
import { Button } from "@/components/ui/button";
import { useRoutineStatusMutation } from "@/hooks/useRoutineStatusMutation";
import { useTaskResourceNames } from "@/hooks/useTaskResourceNames";
import { useWeekTargetWindow } from "@/stores/settingsStore";
import {
  findStatusForDate,
  getTodayKey,
  isHttpUrl,
  isWeeklyTargetMet,
} from "@/utils";

interface RoutineTodayCardProps {
  data: Routine;
}

/**
 * The "Today's Task" card: shows today's scheduled entry (or the single daily
 * item) and the today-status control, which writes back through the routine
 * status mutation.
 */
export function RoutineTodayCard({
  data,
}: RoutineTodayCardProps) {
  const weekTargetWindow = useWeekTargetWindow();
  const {
    taskNames,
  } = useTaskResourceNames();
  const statusMutation = useRoutineStatusMutation(data.id);

  const todayDateKey = getTodayKey();
  const weekly = data.weekly ?? {};
  const isDaily = data.mode === "daily";
  const isCurated = data.mode === "curated";
  const dailyEntry = isDaily
    ? (Object.values(weekly).find(Boolean) ?? null)
    : null;
  // The same day of the week as today (JS getDay: "0" = Sunday … "6" = Saturday).
  // Daily routines mirror their entry onto every day, so this resolves to the
  // single daily item; weekly routines resolve to today's scheduled entry (if any).
  // Curated routines key by the absolute date instead, so they look today up in
  // the date-keyed `curated.entries` map (weekly is empty for them).
  const todayKey = String(new Date().getDay());
  const todayEntry = isCurated
    ? (data.curated?.entries?.[todayDateKey] ?? null)
    : isDaily
      ? dailyEntry
      : (weekly[todayKey as keyof typeof weekly] ?? null);
  // When today's item has a URL location, surface a "Go" button beside the
  // task text so it can be opened in a new tab (non-URL locations show no button).
  const todayLocation = todayEntry?.location ?? null;
  const locationIsUrl = !!todayLocation && isHttpUrl(todayLocation);
  const completions = data.completions ?? [];
  // Daily-mode routines with a met weekly target need nothing more today.
  const weekTargetMet
    = isDaily
      && isWeeklyTargetMet(
        {
          completions,
          weeklyTarget: data.weeklyTarget ?? null,
        },
        todayDateKey,
        weekTargetWindow,
      );

  // A Daily-shaped view of this routine for the shared today's-status modal,
  // which only reads name / completions / criteria / description.
  const dailyForStatus: Daily = {
    id: data.id,
    name: data.name,
    description: data.description,
    completions: data.completions ?? [],
    criteria: data.criteria ?? null,
    status: data.status,
  };
  const todayStatus = findStatusForDate(dailyForStatus, todayDateKey);
  const statusControl = (
    <div className="w-40">
      <TodayStatusCell
        daily={dailyForStatus}
        currentStatus={todayStatus}
        disabled={statusMutation.isPending}
        onChange={(status, note) =>
          statusMutation.mutate({
            daily: dailyForStatus,
            status,
            note,
          })}
      />
    </div>
  );

  return (
    <DashboardCard
      title="Today's Task"
      action={statusControl}
    >
      {todayEntry
        ? (
          <>
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium">
                <RoutineEntryLabel
                  entry={todayEntry}
                  taskNames={taskNames}
                  showMeta={false}
                />
              </p>
              {locationIsUrl && todayLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={todayLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Go
                    <ExternalLink />
                  </a>
                </Button>
              )}
            </div>
            {todayEntry.notes && (
              <p className="text-sm text-muted-foreground">{todayEntry.notes}</p>
            )}
          </>
        )
        : (
          <p className="text-muted-foreground italic">Nothing, take a break!</p>
        )}
      {weekTargetMet && (
        <p className="mt-2 text-sm text-muted-foreground italic">
          Nothing required today — weekly goal met.
        </p>
      )}
    </DashboardCard>
  );
}
