import type { Task } from "@emstack/types";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { TaskBox } from "@/components/contentBoxComponents";
import { PageActions } from "@/components/layout/PageActions";
import {
  EntityError,
  EntityPending,
  ListEmptyStates,
  ListSearchInput,
  PageContainer,
  PageHeader,
} from "@/components/listControls";
import { Button } from "@/components/ui/button";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchTasks } from "@/utils";

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

  const {
    data,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const filtered = useMemo(() => {
    if (!data) return [];

    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(q)
          || (t.description?.toLowerCase().includes(q) ?? false),
      );
    }

    return result;
  }, [data, search]);

  const totalTaskCount = data?.length ?? 0;

  return (
    <div>
      <PageActions>
        <Link
          to="/tasks/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button variant="outline">
            <PlusIcon className="size-4" />
            New Task List
          </Button>
        </Link>
      </PageActions>
      <PageHeader
        pageTitle="Task Lists"
        pageSection=""
        description={ENTITY_DESCRIPTIONS.tasks}
      />
      <PageContainer className="flex flex-col gap-4">
        {data && data.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <ListSearchInput
              placeholder="Search task lists..."
              value={search}
              onChange={setSearch}
            />
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
      </PageContainer>
    </div>
  );
}
