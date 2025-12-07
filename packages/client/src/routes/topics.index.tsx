import type { TopicForTopicsPage } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/button";
import { TopicBox } from "@/components/TopicBox";
import { fetchTopics } from "@/utils/fetchFunctions";

export const Route = createFileRoute("/topics/")({
  component: Topics,
  errorComponent: TopicsError,
  pendingComponent: TopicsPending,
});

function TopicsPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your courses...</h1>
    </div>
  );
}

function TopicsError() {
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

function Topics() {
  const localItem = localStorage.getItem("courseData");
  const local = JSON.parse(localItem ? localItem : "");

  const {
    data,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });
  console.log("data", data);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">{local.name}&#39;s Topics</h1>
      <div
        className={`
          grid grid-cols-1 gap-4 gap-y-6
          sm:grid-cols-2
          md:grid-cols-3
        `}
      >
        {(!data || data.length === 0) && (
          <div className="flex flex-col gap-6">
            <i>No courses yet!</i>

            <Link
              to="/onboard"
              className=""
            >
              <Button>
                Go to onboarding
                {" "}
                <ArrowRightIcon />
              </Button>
            </Link>
          </div>
        )}

        {
          data && data.length > 0 && data.map((topic: TopicForTopicsPage) => {
            if (topic.name === "") {
              return;
            }
            return (
              <TopicBox
                {...topic}
                key={topic.id}
              />
            );
          })
        }
      </div>
    </div>
  );
}
