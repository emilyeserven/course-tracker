import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { TopicList } from "@/components/boxElements/TopicList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CourseInteractionsLog } from "@/components/courses/CourseInteractionsLog";
import { CourseModulesAdmin } from "@/components/courses/CourseModulesAdmin";
import { DailyRecentDaysStrip } from "@/components/dailies";
import { InfoArea } from "@/components/layout/InfoArea";
import { InfoRow } from "@/components/layout/InfoRow";
import {
  fetchSingleResource,
  getCurrentChain,
  getTotalCompletedDays,
  makePercentageComplete,
} from "@/utils";

interface CourseSearch {
  promptDaily?: 1;
}

export const Route = createFileRoute("/resources/$id/")({
  component: SingleCourse,
  validateSearch: (search: Record<string, unknown>): CourseSearch => ({
    promptDaily: search.promptDaily === 1 || search.promptDaily === "1"
      ? 1
      : undefined,
  }),
});

function SingleCourse() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [dailyPromptOpen, setDailyPromptOpen] = useState<boolean>(
    search.promptDaily === 1,
  );

  const {
    data,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchSingleResource(id),
  });

  const percentComplete = makePercentageComplete(
    data?.progressCurrent,
    data?.progressTotal,
  );

  const topics = data?.topics ?? null;
  const dailies = data?.dailies ?? [];

  return (
    <div className="container flex-col gap-12">
      <InfoArea
        header={`Dail${dailies.length === 1 ? "y" : "ies"}`}
        condition={dailies.length > 0}
      >
        <ul className="flex flex-col gap-4">
          {dailies.map((daily) => {
            const chain = getCurrentChain(daily);
            const total = getTotalCompletedDays(daily);
            return (
              <li
                key={daily.id}
                className="flex flex-col gap-2 rounded-sm border p-3"
              >
                <div
                  className="flex flex-row items-center justify-between gap-3"
                >
                  <Link
                    to="/dailies/$id"
                    params={{
                      id: daily.id,
                    }}
                    className={`
                      font-medium
                      hover:text-blue-600
                    `}
                  >
                    {daily.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {`${chain}-day chain · ${total} total`}
                  </span>
                </div>
                <DailyRecentDaysStrip
                  daily={daily}
                  count={14}
                  labelFormat="mmdd"
                  size="sm"
                />
              </li>
            );
          })}
        </ul>
      </InfoArea>
      <InfoArea
        header="About"
        condition={!!data?.description}
      >
        <p>{data?.description}</p>
      </InfoArea>
      <InfoRow header="Basic Info">
        <InfoArea
          header="Provider"
          condition={!!data?.provider}
        >
          {data?.provider && data.provider.name && (
            <Link
              to="/providers/$id"
              from="/resources/$id"
              params={{
                id: data.provider.id + "",
              }}
              className={`
                text-blue-800
                hover:text-blue-600
              `}
            >
              {data?.provider?.name}
            </Link>
          )}
        </InfoArea>
        <InfoArea
          header={`Topic${topics && topics.length > 1 ? "s" : ""}`}
          condition={!!topics}
        >
          <TopicList
            topics={data?.topics}
            isPills={false}
          />
        </InfoArea>
      </InfoRow>
      <InfoRow header="Progress">
        <InfoArea
          header="Current Progress"
          condition={!!data?.progressCurrent}
        >
          <p>{data?.progressCurrent}</p>
        </InfoArea>
        <InfoArea
          header="Total Modules"
          condition={!!data?.progressTotal}
        >
          <p>{data?.progressTotal}</p>
        </InfoArea>
        <InfoArea
          header="% Complete"
          condition={!!data?.progressTotal && !!data?.progressCurrent}
        >
          <p>{percentComplete}%</p>
        </InfoArea>
        {!data?.progressCurrent && !data?.progressTotal && (
          <span>No progress information given.</span>
        )}
      </InfoRow>
      <CourseModulesAdmin
        courseId={id}
        modulesAreExhaustive={data?.modulesAreExhaustive}
      />
      <CourseInteractionsLog courseId={id} />
      <InfoRow
        condition={data?.cost?.cost != null}
        header="Money Things"
      >
        <div className="flex flex-row gap-1">
          <InfoArea
            header="Resource Cost"
            condition={!percentComplete}
          >
            <p>{data?.cost.cost}</p>
          </InfoArea>
          <InfoArea
            header="Cost per Unit"
            condition={!!percentComplete}
          >
            <p>
              <span>
                $
                {Number(
                  Number(data?.cost.cost) / Number(percentComplete),
                ).toFixed(2)}{" "}
                out of ${data?.cost.cost}
              </span>
            </p>
          </InfoArea>
        </div>
      </InfoRow>
      <ConfirmDialog
        open={dailyPromptOpen}
        title="Create a Daily for this resource?"
        description="You marked this resource as active. Want to create a Daily that tracks your progress on it?"
        cancelLabel="No thanks"
        confirmLabel="Create Daily"
        onCancel={async () => {
          setDailyPromptOpen(false);
          await navigate({
            to: "/resources/$id",
            params: {
              id,
            },
            search: {},
            replace: true,
          });
        }}
        onConfirm={async () => {
          setDailyPromptOpen(false);
          await navigate({
            to: "/dailies/$id/edit",
            params: {
              id: "new",
            },
            search: {
              newCourseId: id,
            },
          });
        }}
      />
    </div>
  );
}
