import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { ResourcesList } from "./-components/-ResourcesList";

import { PageActions } from "@/components/layout/PageActions";
import {
  EntityError,
  EntityPending,
  PageHeader,
} from "@/components/listControls";
import { Button } from "@/components/ui/button";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { fetchProviders, fetchResources, fetchTopics } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export interface ResourcesSearch {
  topicId?: string;
}

export const Route = createFileRoute("/resources/")({
  component: Courses,
  errorComponent: CoursesError,
  pendingComponent: CoursesPending,
  validateSearch: (search: Record<string, unknown>): ResourcesSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
  }),
});

function CoursesPending() {
  return <EntityPending entity="resources" />;
}

function CoursesError() {
  return <EntityError entity="resources" />;
}

function Courses() {
  const urlSearch = Route.useSearch();

  const {
    data: resources,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });

  const {
    data: providers,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  return (
    <div>
      <PageActions>
        <Link
          to="/resources/$id/edit"
          params={{
            id: "new",
          }}
        >
          <Button>
            <PlusIcon className="size-4" />
            New Course
          </Button>
        </Link>
      </PageActions>
      <PageHeader
        pageTitle="Your Resources"
        pageSection=""
        description={ENTITY_DESCRIPTIONS.resources}
      />
      <ResourcesList
        resources={resources ?? []}
        providers={providers ?? []}
        topics={topics ?? []}
        initialTopicId={urlSearch.topicId}
      />
    </div>
  );
}
