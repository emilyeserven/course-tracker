import type { CourseProvider } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { ProviderBox } from "@/components/boxes/ProviderBox";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchProviders } from "@/utils/fetchFunctions";

export const Route = createFileRoute("/providers/")({
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
  const {
    data,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  return (
    <div>
      <PageHeader
        pageTitle="Providers"
        pageSection=""
      />
      <div className="container">
        <div className="card-grid">
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
            data && data.length > 0 && data.map((provider: CourseProvider) => {
              if (provider.name === "") {
                return;
              }
              return (
                <ProviderBox
                  {...provider}
                  key={provider.id}
                />
              );
            })
          }
        </div>
      </div>
    </div>
  );
}
