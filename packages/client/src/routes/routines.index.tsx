import type { Routine, RoutineConnectionType } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheckIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";

import { RoutineBox } from "@/components/boxes/RoutineBox";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { FilterOptionCount } from "@/components/FilterOptionCount";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchRoutines } from "@/utils";

interface RoutinesSearch {
  // Legacy alias: `?topicId=` still prefilters by that topic connection.
  topicId?: string;
  connectedType?: RoutineConnectionType;
  connectedId?: string;
}

export const Route = createFileRoute("/routines/")({
  component: Routines,
  errorComponent: RoutinesError,
  pendingComponent: RoutinesPending,
  validateSearch: (search: Record<string, unknown>): RoutinesSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
    connectedType:
      search.connectedType === "topic"
      || search.connectedType === "task"
      || search.connectedType === "resource"
        ? search.connectedType
        : undefined,
    connectedId:
      typeof search.connectedId === "string" && search.connectedId
        ? search.connectedId
        : undefined,
  }),
});

function RoutinesPending() {
  return <EntityPending entity="routines" />;
}

function RoutinesError() {
  return <EntityError entity="routines" />;
}

function Routines() {
  const urlSearch = Route.useSearch();
  const initialConnection
    = urlSearch.connectedType && urlSearch.connectedId
      ? `${urlSearch.connectedType}:${urlSearch.connectedId}`
      : urlSearch.topicId
        ? `topic:${urlSearch.topicId}`
        : undefined;
  const [search, setSearch] = useState("");
  const [filterConnection, setFilterConnection] = useState<string | undefined>(
    initialConnection,
  );
  const [filterMode, setFilterMode] = useState<"weekly" | "daily" | undefined>(
    undefined,
  );

  const {
    data,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: () => fetchRoutines(),
  });

  const filtered = useMemo(() => {
    if (!data) return [];

    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q)
        || (r.description?.toLowerCase().includes(q) ?? false));
    }

    if (filterConnection === "none") {
      result = result.filter(r => !r.connections || r.connections.length === 0);
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
  }, [data, search, filterConnection, filterMode]);

  const hasActiveFilters = !!filterConnection || !!filterMode;

  // Distinct connections across all routines, each with its display name and
  // count, for the filter dropdown.
  const connectionFilterOptions = useMemo(() => {
    const map = new Map<string, {
      value: string;
      name: string;
      type: RoutineConnectionType;
      count: number;
    }>();
    data?.forEach((r) => {
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
  }, [data]);
  const totalRoutineCount = data?.length ?? 0;
  const noConnectionCount = useMemo(
    () =>
      data?.filter(r => !r.connections || r.connections.length === 0).length
      ?? 0,
    [data],
  );

  return (
    <div>
      <PageHeader
        pageTitle="Routines"
        pageSection=""
      >
        <Link to="/routines/tracker">
          <Button variant="outline">
            <CalendarCheckIcon className="size-4" />
            Daily Tracker
          </Button>
        </Link>
        <Link
          to="/routines/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button variant="outline">
            <PlusIcon className="size-4" />
            New Routine
          </Button>
        </Link>
      </PageHeader>
      <div className="container flex flex-col gap-4">
        {data && data.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative">
              <SearchIcon
                className="
                  absolute top-1/2 left-2.5 size-4 -translate-y-1/2
                  text-muted-foreground
                "
              />
              <input
                type="text"
                placeholder="Search routines..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="
                  h-9 rounded-md border border-input bg-transparent pr-3 pl-8
                  text-sm shadow-xs transition-[color,box-shadow] outline-none
                  placeholder:text-muted-foreground
                  focus-visible:border-ring focus-visible:ring-[3px]
                  focus-visible:ring-ring/50
                "
              />
            </div>
            <Select
              value={filterConnection ?? "all"}
              onValueChange={v =>
                setFilterConnection(v === "all" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Connection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span>All Connections</span>
                  <FilterOptionCount count={totalRoutineCount} />
                </SelectItem>
                {noConnectionCount > 0 && (
                  <SelectItem value="none">
                    <span>No Connection</span>
                    <FilterOptionCount count={noConnectionCount} />
                  </SelectItem>
                )}
                {connectionFilterOptions.map(opt => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                  >
                    <span
                      className="mr-1 text-xs text-muted-foreground uppercase"
                    >
                      {opt.type}
                    </span>
                    <span>{opt.name}</span>
                    <FilterOptionCount count={opt.count} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterConnection(undefined);
                  setFilterMode(undefined);
                }}
              >
                <XIcon className="size-4" />
                Clear filters
              </Button>
            )}
          </div>
        )}

        {(!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground">
            <i>No routines yet!</i>
          </p>
        )}

        {data && data.length > 0 && filtered.length === 0 && (
          <div className="text-muted-foreground">
            <i>No routines match your filters.</i>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="card-grid">
            {filtered.map((routine: Routine) => (
              <RoutineBox
                key={routine.id}
                {...routine}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
