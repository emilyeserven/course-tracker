import type { Routine } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";

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
import { fetchRoutines, fetchTopics } from "@/utils";

interface RoutinesSearch {
  topicId?: string;
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
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState<string | undefined>(
    urlSearch.topicId,
  );

  const {
    data,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: () => fetchRoutines(),
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
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

    if (filterTopic === "none") {
      result = result.filter(r => !r.topic);
    }
    else if (filterTopic) {
      result = result.filter(r => r.topic?.id === filterTopic);
    }

    return result;
  }, [data, search, filterTopic]);

  const hasActiveFilters = !!filterTopic;

  const routineCountByTopic = useMemo(() => {
    const counts = new Map<string, number>();
    data?.forEach((r) => {
      const id = r.topic?.id;
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return counts;
  }, [data]);
  const totalRoutineCount = data?.length ?? 0;
  const noTopicCount = useMemo(
    () => data?.filter(r => !r.topic).length ?? 0,
    [data],
  );

  return (
    <div>
      <PageHeader
        pageTitle="Routines"
        pageSection=""
      >
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
              value={filterTopic ?? "all"}
              onValueChange={v =>
                setFilterTopic(v === "all" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span>All Topics</span>
                  <FilterOptionCount count={totalRoutineCount} />
                </SelectItem>
                {noTopicCount > 0 && (
                  <SelectItem value="none">
                    <span>No Topic</span>
                    <FilterOptionCount count={noTopicCount} />
                  </SelectItem>
                )}
                {topics
                  ?.filter(t => (routineCountByTopic.get(t.id) ?? 0) > 0)
                  .map(t => (
                    <SelectItem
                      key={t.id}
                      value={t.id}
                    >
                      <span>{t.name}</span>
                      <FilterOptionCount
                        count={routineCountByTopic.get(t.id) ?? 0}
                      />
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterTopic(undefined);
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
