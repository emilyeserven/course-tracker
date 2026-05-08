import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatchRoute,
} from "@tanstack/react-router";
import { EditIcon, ExternalLink, EyeIcon } from "lucide-react";

import { EntityError, EntityPending } from "@/components/EntityStates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchSingleCourse } from "@/utils";

export const Route = createFileRoute("/courses/$id")({
  component: SingleCourseLayout,
});

function SingleCourseLayout() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";
  const matchRoute = useMatchRoute();
  const isEditing = !!matchRoute({
    to: "/courses/$id/edit",
    params: {
      id,
    },
  });

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchSingleCourse(id),
    enabled: !isNew,
  });

  if (isNew) {
    return (
      <div>
        <PageHeader
          pageTitle="New Course"
          pageSection="courses"
        />
        <Outlet />
      </div>
    );
  }

  if (isPending || !data) {
    return <EntityPending entity="course" />;
  }

  if (error) {
    return <EntityError entity="course" />;
  }

  return (
    <div>
      <PageHeader
        pageTitle={data.name}
        pageSection="courses"
        progressCurrent={data.progressCurrent ?? 0}
        progressTotal={data.progressTotal ?? 0}
        status={data.status}
      >
        <div className="flex flex-row gap-2">
          {!!data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
            >
              <Button>
                Go to Course
                <ExternalLink />
              </Button>
            </a>
          )}
          {isEditing
            ? (
              <Link
                to="/courses/$id"
                params={{
                  id: data.id + "",
                }}
              >
                <Button variant="secondary">
                  View Course
                  {" "}
                  <EyeIcon />
                </Button>
              </Link>
            )
            : (
              <Link
                to="/courses/$id/edit"
                params={{
                  id: data.id + "",
                }}
              >
                <Button variant="secondary">
                  Edit Course
                  {" "}
                  <EditIcon />
                </Button>
              </Link>
            )}
        </div>
      </PageHeader>
      <Outlet />
    </div>
  );
}
