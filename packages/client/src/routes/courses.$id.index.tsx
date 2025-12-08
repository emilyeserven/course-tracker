import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, ExternalLink } from "lucide-react";

import { TopicList } from "@/components/boxElements/TopicList";
import { InfoArea } from "@/components/layout/InfoArea";
import { InfoRow } from "@/components/layout/InfoRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchSingleCourse } from "@/utils/fetchFunctions";
import { makePercentageComplete } from "@/utils/makePercentageComplete";

export const Route = createFileRoute("/courses/$id/")({
  component: SingleCourse,
});

function CoursesPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your courses...</h1>
    </div>
  );
}

function CoursesError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading your courses.</h1>
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

function SingleCourse() {
  const {
    id,
  } = Route.useParams();

  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchSingleCourse(id),
  });

  if (isPending) {
    <CoursesPending />;
  }

  if (error) {
    <CoursesError />;
  }

  const percentComplete = makePercentageComplete(data?.progressCurrent, data?.progressTotal);

  const topics = data?.topics ?? null;

  return (
    <div>
      <PageHeader
        pageTitle={data?.name}
        pageSection="courses"
      >
        <div className="flex flex-row gap-2">
          {!!data?.url && (
            <a
              href={data?.url}
              target="_blank"
              rel="noreferrer"
            >
              <Button>
                Go to Course
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
              Edit Course
              {" "}
              <EditIcon />
            </Button>
          </Link>
        </div>
      </PageHeader>
      <div className="container flex-col gap-12">
        <InfoArea
          header="About"
          condition={!!data?.description}
        >
          <p>
            {data?.description}
          </p>
        </InfoArea>
        <InfoRow header="Basic Info">
          <InfoArea
            header="Course Provider"
            condition={!!data?.provider}
          >
            {data?.provider}
          </InfoArea>
          <InfoArea
            header={`Topic${topics && topics.length > 1 ? "s" : ""}`}
            condition={!!topics}
          >
            <TopicList
              topics={data?.topics}
            />
          </InfoArea>
        </InfoRow>
        <InfoRow header="Progress">
          <InfoArea
            header="Current Progress"
            condition={!!data?.progressCurrent}
          >
            <p>
              {data?.progressCurrent}
            </p>
          </InfoArea>
          <InfoArea
            header="Total Modules"
            condition={!!data?.progressTotal}
          >
            <p>
              {data?.progressTotal}
            </p>
          </InfoArea>
          <InfoArea
            header="% Complete"
            condition={!!data?.progressTotal && !!data?.progressCurrent}
          >
            <p>
              {percentComplete}%
            </p>
          </InfoArea>
          {!data?.progressCurrent && !data?.progressTotal && (
            <span>No progress information given.</span>
          )}
        </InfoRow>
        <InfoRow
          condition={!!data?.cost}
          header="Money Things"
        >
          <div className="flex flex-row gap-1">
            <InfoArea
              header="Course Cost"
              condition={!percentComplete}
            >
              <p>
                {data?.cost.cost}
              </p>
            </InfoArea>
            <InfoArea
              header="Amortization"
              condition={!!percentComplete}
            >
              <p>
                <span>${Number(Number(data?.cost.cost) / Number(percentComplete)).toFixed(2)} out of ${data?.cost.cost}</span>
              </p>
            </InfoArea>
          </div>
        </InfoRow>
      </div>
    </div>
  );
}
