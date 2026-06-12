import type { Task } from "@emstack/types";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { TaskBox } from "@/components/boxes/TaskBox";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { FilterOptionCount } from "@/components/FilterOptionCount";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  ClearFiltersButton,
  ListEmptyStates,
  ListSearchInput,
} from "@/components/ListPageControls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchTasks, fetchTopics } from "@/utils";

export interface TasksSearch {
  topicId?: string;
}

export const Route = createFileRoute("/tasks/")({
  component: Tasks,
  errorComponent: TasksError,
  pendingComponent: TasksPending,
  validateSearch: (search: Record<string, unknown>): TasksSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
  }),
});

function TasksPending() {
  return <EntityPending entity="tasks" />;
}

function TasksError() {
  return <EntityError entity="tasks" />;
}

function Tasks() {
  const urlSearch = Route.useSearch();
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState<string | undefined>(
    urlSearch.topicId,
  );

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
        description={ENTITY_DESCRIPTIONS.tasks}
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
            <ListSearchInput
              placeholder="Search tasks..."
              value={search}
              onChange={setSearch}
            />
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
                {noTopicCount > 0 && (
                  <SelectItem value="none">
                    <span>No Topic</span>
                    <FilterOptionCount count={noTopicCount} />
                  </SelectItem>
                )}
                {topics
                  ?.filter(t => (taskCountByTopic.get(t.id) ?? 0) > 0)
                  .map(t => (
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
              <ClearFiltersButton
                onClick={() => {
                  setFilterTopic(undefined);
                }}
              />
            )}
          </div>
        )}

        <ListEmptyStates
          entityLabel="tasks"
          total={totalTaskCount}
          filteredCount={filtered.length}
        />

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
