import type {
  Routine,
  RoutineConnectionType,
  RoutineTodayAction,
} from "@emstack/types";

import { useMemo, useState } from "react";

import { RoutineBox } from "@/components/boxes";
import {
  ClearFiltersButton,
  FilterSelect,
  ListEmptyStates,
  ListSearchInput,
} from "@/components/listControls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RoutinesListProps {
  routines: Routine[];
  // Today's scheduled action for a weekly routine (display name + affixes), or
  // null for daily/unscheduled routines. The caller resolves it because it
  // depends on query-backed task/resource name lookups.
  resolveTodayAction: (routine: Routine) => RoutineTodayAction | null;
  initialConnection?: string;
}

export function RoutinesList({
  routines,
  resolveTodayAction,
  initialConnection,
}: RoutinesListProps) {
  const [search, setSearch] = useState("");
  const [filterConnection, setFilterConnection] = useState<string | undefined>(
    initialConnection,
  );
  const [filterMode, setFilterMode] = useState<"weekly" | "daily" | undefined>(
    undefined,
  );

  const filtered = useMemo(() => {
    let result = routines;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        r =>
          r.name.toLowerCase().includes(q)
          || (r.description?.toLowerCase().includes(q) ?? false),
      );
    }

    if (filterConnection === "none") {
      result = result.filter(
        r => !r.connections || r.connections.length === 0,
      );
    }
    else if (filterConnection) {
      result = result.filter(r =>
        (r.connections ?? []).some(
          c => `${c.type}:${c.id}` === filterConnection,
        ));
    }

    if (filterMode) {
      // Pre-existing routines default to "weekly" when mode is absent.
      result = result.filter(r => (r.mode ?? "weekly") === filterMode);
    }

    return result;
  }, [routines, search, filterConnection, filterMode]);

  const hasActiveFilters = !!filterConnection || !!filterMode;

  // Distinct connections across all routines, each with its display name and
  // count, for the filter dropdown.
  const connectionFilterOptions = useMemo(() => {
    const map = new Map<
      string,
      {
        value: string;
        name: string;
        type: RoutineConnectionType;
        count: number;
      }
    >();
    routines.forEach((r) => {
      r.connections?.forEach((c) => {
        const value = `${c.type}:${c.id}`;
        const existing = map.get(value);
        if (existing) {
          existing.count += 1;
        }
        else {
          map.set(value, {
            value,
            name: c.name ?? c.id,
            type: c.type,
            count: 1,
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name));
  }, [routines]);
  const totalRoutineCount = routines.length;
  const noConnectionCount = useMemo(
    () =>
      routines.filter(r => !r.connections || r.connections.length === 0)
        .length,
    [routines],
  );

  return (
    <div className="container flex flex-col gap-4">
      {routines.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ListSearchInput
            placeholder="Search routines..."
            value={search}
            onChange={setSearch}
          />
          <FilterSelect
            placeholder="Connection"
            value={filterConnection}
            onChange={setFilterConnection}
            allLabel="All Connections"
            totalCount={totalRoutineCount}
            noneLabel="No Connection"
            noneCount={noConnectionCount}
            options={connectionFilterOptions.map(opt => ({
              value: opt.value,
              label: opt.name,
              count: opt.count,
              prefix: opt.type,
            }))}
          />
          <Select
            value={filterMode ?? "all"}
            onValueChange={v =>
              setFilterMode(v === "all" ? undefined : (v as "weekly" | "daily"))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="weekly">Weekly Schedule</SelectItem>
              <SelectItem value="daily">Daily Task</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <ClearFiltersButton
              onClick={() => {
                setFilterConnection(undefined);
                setFilterMode(undefined);
              }}
            />
          )}
        </div>
      )}

      <ListEmptyStates
        entityLabel="routines"
        total={totalRoutineCount}
        filteredCount={filtered.length}
      />

      {filtered.length > 0 && (
        <div className="card-grid">
          {filtered.map((routine: Routine) => (
            <RoutineBox
              key={routine.id}
              {...routine}
              todayAction={resolveTodayAction(routine)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
