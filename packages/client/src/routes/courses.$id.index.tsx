import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { TopicList } from "@/components/boxElements/TopicList";
import { DailyStatusCircle } from "@/components/dailies";
import { InfoArea } from "@/components/layout/InfoArea";
import { InfoRow } from "@/components/layout/InfoRow";
import { DeleteButton } from "@/components/ui/DeleteButton";
import {
  deleteSingleCourse,
  fetchSingleCourse,
  findStatusForDate,
  getCurrentChain,
  getTodayKey,
  getTotalCompletedDays,
  makePercentageComplete,
} from "@/utils";

export const Route = createFileRoute("/courses/$id/")({
  component: SingleCourse,
});

function SingleCourse() {
  const {
    id,
  } = Route.useParams();
  const navigate = useNavigate();

  const {
    data,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchSingleCourse(id),
  });

  const {
    refetch: deleteCourse,
  } = useQuery({
    queryKey: ["course", id],
    enabled: false,
    queryFn: () => deleteSingleCourse(id),
  });

  const percentComplete = makePercentageComplete(
    data?.progressCurrent,
    data?.progressTotal,
  );

  const topics = data?.topics ?? null;
  const dailies = data?.dailies ?? [];
  const todayKey = getTodayKey();

  async function handleDelete() {
    await deleteCourse();
    await navigate({
      to: "/courses",
    });
  }

  return (
    <div className="container flex-col gap-12">
      <InfoArea
        header="About"
        condition={!!data?.description}
      >
        <p>{data?.description}</p>
      </InfoArea>
      <InfoRow header="Basic Info">
        <InfoArea
          header="Course Provider"
          condition={!!data?.provider}
        >
          {data?.provider && data.provider.name && (
            <Link
              to="/providers/$id"
              from="/courses/$id"
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
      <InfoRow
        condition={data?.cost?.cost != null}
        header="Money Things"
      >
        <div className="flex flex-row gap-1">
          <InfoArea
            header="Course Cost"
            condition={!percentComplete}
          >
            <p>{data?.cost.cost}</p>
          </InfoArea>
          <InfoArea
            header="Amortization"
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
      <InfoArea
        header={`Daili${dailies.length === 1 ? "y" : "es"}`}
        condition={dailies.length > 0}
      >
        <ul className="flex flex-col gap-2">
          {dailies.map((daily) => {
            const todayStatus = findStatusForDate(daily, todayKey);
            const chain = getCurrentChain(daily, todayKey);
            const total = getTotalCompletedDays(daily);
            return (
              <li
                key={daily.id}
                className="flex flex-row items-center gap-3"
              >
                <DailyStatusCircle
                  status={todayStatus}
                  size="sm"
                  title={`Today: ${todayStatus ?? "no entry"}`}
                />
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
              </li>
            );
          })}
        </ul>
      </InfoArea>
      <div>
        <DeleteButton onClick={handleDelete}>Delete Course</DeleteButton>
      </div>
    </div>
  );
}
