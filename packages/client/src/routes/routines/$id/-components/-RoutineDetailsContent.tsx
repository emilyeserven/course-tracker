import type { Routine } from "@emstack/types";

import { FlameIcon, LaughIcon } from "lucide-react";

import { OpenBookmarkPageButton } from "@/components/bookmarks";
import { EntityLink } from "@/components/boxElements";
import { InfoArea } from "@/components/layout";
import {
  curatedDateRange,
  DAY_LABELS,
  DAY_ORDER,
  formatCuratedDateLabel,
  RoutineEntryLabel,
} from "@/components/routines";
import { useBookmarkLinking } from "@/hooks/useBookmarkLinking";
import { useTaskResourceNames } from "@/hooks/useTaskResourceNames";
import {
  connectionEntityKind,
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
  const {
    resolveHref,
  } = useBookmarkLinking();

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
        <ul className="flex flex-col gap-1">
          {data.connections?.map(c => (
            <li key={`${c.type}:${c.id}`}>
              {c.type === "bookmark"
                ? (
                  <span className="inline-flex items-center gap-1">
                    <a
                      href={
                        resolveHref({
                          externalId: c.id,
                          url: c.url ?? null,
                        }) ?? undefined
                      }
                      target="_blank"
                      rel="noreferrer"
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
                      {c.sectionLabel && (
                        <span className="ml-1 font-normal opacity-70">
                          › {c.sectionLabel}
                        </span>
                      )}
                    </a>
                    <OpenBookmarkPageButton
                      linkable={{
                        externalId: c.id,
                        url: c.url ?? null,
                      }}
                    />
                  </span>
                )
                : (
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
                )}
            </li>
          ))}
        </ul>
      </InfoArea>
      {!isDaily && !isCurated && (
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
                  <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
                  {entry
                    ? (
                      <RoutineEntryLabel
                        entry={entry}
                        taskNames={taskNames}
                      />
                    )
                    : (
                      <span className="text-sm text-muted-foreground italic">
                        Nothing scheduled
                      </span>
                    )}
                </li>
              );
            })}
          </ul>
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
              <ul className="flex flex-col gap-1">
                {curatedDates.map((dateKey) => {
                  const entry = data.curated?.entries?.[dateKey];
                  return (
                    <li
                      key={dateKey}
                      className="
                        grid grid-cols-[150px_1fr] items-center gap-2 border-b
                        border-border/60 py-1
                      "
                    >
                      <span className="text-sm font-medium">
                        {formatCuratedDateLabel(dateKey)}
                      </span>
                      {entry
                        ? (
                          <RoutineEntryLabel
                            entry={entry}
                            taskNames={taskNames}
                          />
                        )
                        : (
                          <span className="text-sm text-muted-foreground italic">
                            Nothing scheduled
                          </span>
                        )}
                    </li>
                  );
                })}
              </ul>
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
