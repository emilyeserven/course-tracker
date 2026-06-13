import type { Routine } from "@emstack/types";

import { FlameIcon, LaughIcon } from "lucide-react";

import { EntityLink } from "@/components/boxElements";
import { InfoArea } from "@/components/layout";
import { DAY_LABELS, DAY_ORDER, RoutineEntryLabel } from "@/components/routines";
import { useTaskResourceNames } from "@/hooks/useTaskResourceNames";
import {
  connectionEntityKind,
  getCurrentChain,
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
    resourceNames,
  } = useTaskResourceNames();

  const weekly = data.weekly ?? {};
  const isDaily = data.mode === "daily";
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
            {isDaily ? "Daily Task" : "Weekly Schedule"}
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
                  className={chain > 0
                    ? "text-orange-600"
                    : "text-muted-foreground"}
                />
                <strong>{chain}</strong>
                <span className="text-muted-foreground">day chain</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <LaughIcon
                  size={16}
                  className={total > 0
                    ? "text-emerald-600"
                    : "text-muted-foreground"}
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
        <ul className="flex flex-col gap-1">
          {data.connections?.map(c => (
            <li key={`${c.type}:${c.id}`}>
              <EntityLink
                entity={connectionEntityKind(c.type)}
                id={c.id}
                className={`
                  font-bold text-blue-800
                  hover:text-blue-600
                  dark:text-blue-300
                `}
              >
                <span
                  className="mr-2 text-xs text-muted-foreground uppercase"
                >
                  {c.type}
                </span>
                {c.name ?? c.id}
              </EntityLink>
            </li>
          ))}
        </ul>
      </InfoArea>
      {!isDaily && (
        <InfoArea
          header="Weekly Schedule"
          condition={true}
        >
          <ul className="flex flex-col gap-1">
            {DAY_ORDER.map((day) => {
              const entry = weekly[day];
              return (
                <li
                  key={day}
                  className="
                    grid grid-cols-[120px_1fr] items-center gap-2 border-b
                    border-border/60 py-1
                  "
                >
                  <span className="text-sm font-medium">
                    {DAY_LABELS[day]}
                  </span>
                  {entry
                    ? (
                      <RoutineEntryLabel
                        entry={entry}
                        taskNames={taskNames}
                        resourceNames={resourceNames}
                      />
                    )
                    : (
                      <span
                        className="text-sm text-muted-foreground italic"
                      >
                        Nothing scheduled
                      </span>
                    )}
                </li>
              );
            })}
          </ul>
        </InfoArea>
      )}
    </div>
  );
}
