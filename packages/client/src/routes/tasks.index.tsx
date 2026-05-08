import type { Task } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";

import { TaskBox } from "@/components/boxes/TaskBox";
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
import { fetchTasks, fetchTopics } from "@/utils";

export const Route = createFileRoute("/tasks/")({
  component: Tasks,
  errorComponent: TasksError,
  pendingComponent: TasksPending,
});

function TasksPending() {
  return <EntityPending entity="tasks" />;
}

function TasksError() {
  return <EntityError entity="tasks" />;
}

function Tasks() {
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState<string | undefined>();

  const {
    data,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
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
      result = result.filter(t =>
        t.name.toLowerCase().includes(q)
        || (t.description?.toLowerCase().includes(q) ?? false));
    }

    if (filterTopic === "none") {
      result = result.filter(t => !t.topic);
    }
    else if (filterTopic) {
      result = result.filter(t => t.topic?.id === filterTopic);
    }

    return result;
  }, [data, search, filterTopic]);

  const hasActiveFilters = !!filterTopic;

  const taskCountByTopic = useMemo(() => {
    const counts = new Map<string, number>();
    data?.forEach((t) => {
      const id = t.topic?.id;
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return counts;
  }, [data]);
  const totalTaskCount = data?.length ?? 0;
  const noTopicCount = useMemo(
    () => data?.filter(t => !t.topic).length ?? 0,
    [data],
  );

  return (
    <div>
      <PageHeader
        pageTitle="Tasks"
        pageSection=""
      >
        <Link
          to="/tasks/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button variant="outline">
            <PlusIcon className="size-4" />
            New Task
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
                placeholder="Search tasks..."
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
                  <FilterOptionCount count={totalTaskCount} />
                </SelectItem>
                <SelectItem value="none">
                  <span>No Topic</span>
                  <FilterOptionCount count={noTopicCount} />
                </SelectItem>
                {topics?.map(t => (
                  <SelectItem
                    key={t.id}
                    value={t.id}
                  >
                    <span>{t.name}</span>
                    <FilterOptionCount
                      count={taskCountByTopic.get(t.id) ?? 0}
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
            <i>No tasks yet!</i>
          </p>
        )}

        {data && data.length > 0 && filtered.length === 0 && (
          <div className="text-muted-foreground">
            <i>No tasks match your filters.</i>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="card-grid">
            {filtered.map((task: Task) => (
              <TaskBox
                key={task.id}
                {...task}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
