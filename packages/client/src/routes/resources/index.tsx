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
import { fetchProviders, fetchResources } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export const Route = createFileRoute("/resources/")({
  component: Courses,
  errorComponent: CoursesError,
  pendingComponent: CoursesPending,
});

function CoursesPending() {
  return <EntityPending entity="resources" />;
}

function CoursesError() {
  return <EntityError entity="resources" />;
}

function Courses() {
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
      />
    </div>
  );
}
