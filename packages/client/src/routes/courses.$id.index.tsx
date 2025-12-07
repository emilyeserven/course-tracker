import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EditIcon, ExternalLink } from "lucide-react";

import { Button } from "@/components/button";
import { InfoArea } from "@/components/InfoArea";
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

  return (
    <div>
      <div className="flex flex-row gap-3">
        <Link
          to="/courses"
          className="mb-8 flex flex-row"
        >
          Courses
        </Link>
        <span>/</span>
        <span className="font-bold">{data?.name}</span>
      </div>
      <span className="mb-4 text-lg">COURSE</span>
      <h1 className="mb-4 text-3xl">{data?.name}</h1>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col">
          {data?.provider && (
            <div className="flex flex-row gap-4">
              <b>Course Provider</b>
              {data.provider}
            </div>
          )}
          {data?.topics && (
            <div className="flex flex-row gap-4">
              <b>Topic</b>
              {data.topics.map(topic => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
          )}

          <InfoArea
            header="About"
            condition={!!data?.description}
          >
            <p>
              {data?.description}
            </p>
          </InfoArea>
        </div>
        <div>
          <h2 className="mb-1 text-2xl">Progress</h2>
          <div className="flex flex-row gap-8">

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
          </div>
        </div>
        {data?.cost && (
          <div>
            <h2 className="text-2xl">Amortization</h2>
            <div className="flex flex-row gap-1">
              {data.cost && !percentComplete && (
                <div className="flex flex-row gap-4">
                  <b>Course Cost</b>
                  {data.cost.cost}
                </div>
              )}

              {data?.cost && percentComplete && (
                <span>${Number(Number(data.cost.cost) / Number(percentComplete)).toFixed(2)} out of ${data.cost.cost}</span>
              )}
            </div>
          </div>
        )}
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
      </div>
    </div>
  );
}
