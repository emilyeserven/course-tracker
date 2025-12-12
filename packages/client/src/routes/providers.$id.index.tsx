import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EditIcon, ExternalLink } from "lucide-react";

import { YesNoDisplay } from "@/components/boxElements/YesNoDisplay";
import { InfoArea } from "@/components/layout/InfoArea";
import { InfoRow } from "@/components/layout/InfoRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteSinglePlatform, fetchSingleProvider } from "@/utils/fetchFunctions";

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
  const navigate = useNavigate();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["provider", id],
    queryFn: () => fetchSingleProvider(id),
  });

  const {
    refetch: deletePlatform,
  } = useQuery({
    queryKey: ["provider", "delete", id],
    enabled: false,
    queryFn: () => deleteSinglePlatform(id),
  });

  if (isPending) {
    <TopicPending />;
  }

  if (error) {
    <TopicError />;
  }

  async function handleDelete() {
    await deletePlatform();
    await navigate({
      to: "/providers",
    });
  }

  return (
    <div>
      <PageHeader
        pageTitle={data?.name}
        pageSection="providers"
      >
        <div className="flex flex-row gap-2">
          {!!data?.url && (
            <a
              href={data?.url}
              target="_blank"
              rel="noreferrer"
            >
              <Button>
                Go to Platform
                <ExternalLink />
              </Button>
            </a>
          )}
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
        <InfoRow
          header="Money Things"
        >
          <InfoArea
            header="Course Cost"
            condition={!!data?.cost}
          >
            <p>
              ${data?.cost}
            </p>
          </InfoArea>
          <InfoArea
            header="Fees Shared BTW Courses?"
          >
            <YesNoDisplay value={!!data?.isCourseFeesShared} />
          </InfoArea>
          <InfoArea
            header="Re-Up Date"
            condition={!!data?.recurDate}
          >
            {data?.recurDate}
          </InfoArea>

          <InfoArea
            header="Subscription Recurrance"
            condition={!!data?.recurPeriodUnit}
          >
            <span
              className="first-letter:uppercase"
            >
              {data?.recurPeriodUnit && (
                `Every ${data?.recurPeriod ? data.recurPeriod : ""} ${data.recurPeriodUnit}`
              )}
            </span>

          </InfoArea>
        </InfoRow>
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
        <div>
          <DeleteButton onClick={handleDelete}>
            Delete Platform
          </DeleteButton>
        </div>
      </div>
    </div>
  );
}
