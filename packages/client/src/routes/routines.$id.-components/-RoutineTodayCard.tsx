import type { Daily, Routine } from "@emstack/types";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { TodayStatusCell } from "@/components/dailies";
import { RoutineEntryLabel } from "@/components/routines";
import { useRoutineStatusMutation } from "@/hooks/useRoutineStatusMutation";
import { useSettings } from "@/hooks/useSettings";
import { useTaskResourceNames } from "@/hooks/useTaskResourceNames";
import { findStatusForDate, getTodayKey, isWeeklyTargetMet } from "@/utils";

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
  const {
    settings,
  } = useSettings();
  const {
    taskNames,
    resourceNames,
  } = useTaskResourceNames();
  const statusMutation = useRoutineStatusMutation(data.id);

  const todayDateKey = getTodayKey();
  const weekly = data.weekly ?? {};
  const isDaily = data.mode === "daily";
  const dailyEntry = isDaily
    ? Object.values(weekly).find(Boolean) ?? null
    : null;
  // The same day of the week as today (JS getDay: "0" = Sunday … "6" = Saturday).
  // Daily routines mirror their entry onto every day, so this resolves to the
  // single daily item; weekly routines resolve to today's scheduled entry (if any).
  const todayKey = String(new Date().getDay());
  const todayEntry = isDaily
    ? dailyEntry
    : (weekly[todayKey as keyof typeof weekly] ?? null);
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
        settings.weekTargetWindow,
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
            <p className="text-lg font-medium">
              <RoutineEntryLabel
                entry={todayEntry}
                taskNames={taskNames}
                resourceNames={resourceNames}
                showMeta={false}
              />
            </p>
            {todayEntry.notes && (
              <p className="text-sm text-muted-foreground">
                {todayEntry.notes}
              </p>
            )}
          </>
        )
        : (
          <p className="text-muted-foreground italic">
            Nothing, take a break!
          </p>
        )}
      {weekTargetMet && (
        <p className="mt-2 text-sm text-muted-foreground italic">
          Nothing required today — weekly goal met.
        </p>
      )}
    </DashboardCard>
  );
}
