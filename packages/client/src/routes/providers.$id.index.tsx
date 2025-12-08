import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";

import { InfoArea } from "@/components/layout/InfoArea";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchSingleProvider } from "@/utils/fetchFunctions";

export const Route = createFileRoute("/providers/$id/")({
  component: SingleProviders,
});

function TopicPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your topics...</h1>
    </div>
  );
}

function TopicError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading your topics.</h1>
      <p>
        Try to use the
        {" "}
        <Link to="/onboard">Onboarding Wizard</Link>
        {" "}
        again, or load in properly formed course data.
      </p>
    </div>
  );
}

function SingleProviders() {
  const {
    id,
  } = Route.useParams();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["provider", id],
    queryFn: () => fetchSingleProvider(id),
  });

  if (isPending) {
    <TopicPending />;
  }

  if (error) {
    <TopicError />;
  }

  return (
    <div>
      <PageHeader
        pageTitle={data?.name}
        pageSection="providers"
      >
        <div className="flex flex-row gap-2">
          <Link
            to="/courses/$id/edit"
            params={{
              id: data?.id + "",
            }}
            disabled={true}
          >
            <Button
              variant="secondary"
              disabled={true}
            >
              Edit Provider
              {" "}
              <EditIcon />
            </Button>
          </Link>
        </div>
      </PageHeader>
      <div className="container flex flex-col gap-12">
        <InfoArea
          header="About"
          condition={!!data?.description}
        >
          <p>
            {data?.description}
          </p>
        </InfoArea>
        <div>
          <InfoArea
            header="Courses"
            condition={!!data?.courseCount && data.courseCount > 0}
          >
            <ul className="ml-5 list-disc">
              {data?.courses && data.courses.map(course => (
                <li key={course.id}>
                  <Link
                    to="/courses/$id"
                    from="/topics/$id"
                    params={{
                      id: course.id + "",
                    }}
                    className={`
                      font-bold text-blue-800
                      hover:text-blue-600
                    `}
                  >{course.name}
                  </Link>
                </li>
              ))}
            </ul>
          </InfoArea>
        </div>
      </div>
    </div>
  );
}
