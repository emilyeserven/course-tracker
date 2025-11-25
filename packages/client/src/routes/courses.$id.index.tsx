import type { Course } from "@/routes/courses";

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, EditIcon, ExternalLink } from "lucide-react";

import { Button } from "@/components/button";
import { getCourse } from "@/utils/getCourse";
import { makePercentageComplete } from "@/utils/makePercentageComplete";

export const Route = createFileRoute("/courses/$id/")({
  loader: async ({
    params,
  }) => {
    return getCourse(params.id);
  },
  component: SingleCourse,
});

function SingleCourse() {
  const data: Course = Route.useLoaderData();

  const percentComplete = makePercentageComplete(data?.progressCurrent, data?.progressTotal);

  return (
    <div>
      <Link
        to="/courses"
        className="mb-8 flex flex-row"
      >
        <ArrowLeft />
        {" "}
        Courses
      </Link>
      <span className="mb-4 text-lg">COURSE</span>
      <h1 className="mb-4 text-3xl">{data.name}</h1>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col">
          {data?.service && (
            <div className="flex flex-row gap-4">
              <b>Course Provider</b>
              {data.service}
            </div>
          )}
          {data?.topic && (
            <div className="flex flex-row gap-4">
              <b>Topic</b>
              {data.topic}
            </div>
          )}

          {data?.description && (
            <p>
              {data.description}
            </p>
          )}
        </div>
        <div>
          <h2 className="mb-1 text-2xl">Progress</h2>
          <div className="flex flex-col gap-1">
            {!!data?.progressCurrent && (
              <div className="flex flex-row gap-4">
                <b>Current Progress</b>
                {data.progressCurrent}
              </div>
            )}

            {!!data?.progressTotal && (
              <div className="flex flex-row gap-4">
                <b>Total Modules</b>
                {data.progressTotal}
              </div>
            )}
            {!!data?.progressCurrent && !!data?.progressTotal && (
              <div className="flex flex-row gap-4">
                <b>% Complete</b>
                {percentComplete}
                %
              </div>
            )}
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
                  {data.cost}
                </div>
              )}

              {data?.cost && percentComplete && (
                <span>${Number(Number(data.cost) / Number(percentComplete)).toFixed(2)} out of ${data.cost}</span>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-row gap-2">
          <a
            href={data.link}
            target="_blank"
            rel="noreferrer"
          >
            <Button>
              Go to Course
              <ExternalLink />
            </Button>
          </a>
          <Link
            to="/courses/$id/edit"
            params={{
              id: data.id,
            }}
          >
            <Button variant="secondary">
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
