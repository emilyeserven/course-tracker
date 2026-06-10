import { useQuery } from "@tanstack/react-query";
import { FlameIcon, LaughIcon } from "lucide-react";

import { DailyCompletionsManager } from "./DailyCompletionsManager";
import { DailyRecentDaysStrip } from "./DailyRecentDaysStrip";
import { DAILY_STATUS_OPTIONS } from "./dailyStatusMeta";

import { EntityError, EntityPending } from "@/components/EntityStates";
import { InfoArea } from "@/components/layout/InfoArea";
import {
  fetchSingleDaily,
  getCurrentChain,
  getTotalCompletedDays,
  isHttpUrl,
} from "@/utils";

interface DailyDetailsPanelProps {
  dailyId: string;
}

export function DailyDetailsPanel({
  dailyId,
}: DailyDetailsPanelProps) {
  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["daily", dailyId],
    queryFn: () => fetchSingleDaily(dailyId),
  });

  if (isPending) {
    return <EntityPending entity="daily" />;
  }

  if (error || !data) {
    return <EntityError entity="daily" />;
  }

  const total = getTotalCompletedDays(data);
  const chain = getCurrentChain(data);
  const locationIsUrl = !!data.location && isHttpUrl(data.location);
  const isComplete = data.status === "complete";
  const criteria = data.criteria ?? {};
  const criteriaLabels: { key: keyof typeof criteria;
    label: string;
    icon: React.ReactNode; }[] = [
    {
      key: "incomplete",
      label: DAILY_STATUS_OPTIONS.find(o => o.value === "incomplete")?.label
        ?? "Incomplete",
      icon: DAILY_STATUS_OPTIONS.find(o => o.value === "incomplete")?.icon,
    },
    {
      key: "touched",
      label: DAILY_STATUS_OPTIONS.find(o => o.value === "touched")?.label
        ?? "Touched",
      icon: DAILY_STATUS_OPTIONS.find(o => o.value === "touched")?.icon,
    },
    {
      key: "goal",
      label: "Completed",
      icon: DAILY_STATUS_OPTIONS.find(o => o.value === "goal")?.icon,
    },
    {
      key: "exceeded",
      label: DAILY_STATUS_OPTIONS.find(o => o.value === "exceeded")?.label
        ?? "Exceeded",
      icon: DAILY_STATUS_OPTIONS.find(o => o.value === "exceeded")?.icon,
    },
    {
      key: "freeze",
      label: DAILY_STATUS_OPTIONS.find(o => o.value === "freeze")?.label
        ?? "Freeze",
      icon: DAILY_STATUS_OPTIONS.find(o => o.value === "freeze")?.icon,
    },
  ];
  const visibleCriteria = criteriaLabels.filter(c => !!criteria[c.key]);

  return (
    <div className="flex flex-col gap-12">
      <InfoArea
        header="Description"
        condition={!!data.description}
      >
        <p>{data.description}</p>
      </InfoArea>
      <InfoArea
        header="Location"
        condition={!!data.location && !locationIsUrl}
      >
        <p>{data.location}</p>
      </InfoArea>
      <InfoArea
        header="Provider"
        condition={!!data.provider}
      >
        <p>{data.provider?.name}</p>
      </InfoArea>
      <InfoArea
        header="Last 14 days"
        condition={true}
      >
        <DailyRecentDaysStrip
          daily={data}
          count={14}
          labelFormat="mmdd"
        />
      </InfoArea>
      <InfoArea
        header="Stats"
        condition={true}
      >
        <div className="flex flex-row flex-wrap gap-6 text-sm">
          <span className="inline-flex items-center gap-1">
            <FlameIcon
              size={16}
              className={chain > 0
                ? "text-orange-600"
                : "text-muted-foreground"}
            />
            <strong>{chain}</strong>
            <span className="text-muted-foreground">day chain</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <LaughIcon
              size={16}
              className={total > 0
                ? "text-emerald-600"
                : "text-muted-foreground"}
            />
            <strong>{total}</strong>
            <span className="text-muted-foreground">total days</span>
          </span>
        </div>
      </InfoArea>
      {visibleCriteria.length > 0 && (
        <InfoArea
          header="Status Criteria"
          condition={true}
        >
          <dl className="flex flex-col gap-2">
            {visibleCriteria.map(c => (
              <div
                key={c.key}
                className="flex flex-col gap-0.5"
              >
                <dt
                  className="
                    flex flex-row items-center gap-1.5 text-sm font-bold
                  "
                >
                  <span className="inline-flex shrink-0 items-center">
                    {c.icon}
                  </span>
                  <span>{c.label}</span>
                </dt>
                <dd
                  className="
                    pl-6 text-sm whitespace-pre-wrap text-muted-foreground
                  "
                >
                  {criteria[c.key]}
                </dd>
              </div>
            ))}
          </dl>
        </InfoArea>
      )}
      <InfoArea
        header={isComplete ? "Day entries (completed)" : "Day entries"}
        condition={true}
      >
        <DailyCompletionsManager
          daily={data}
          readOnly={data.status !== "active"}
        />
      </InfoArea>
    </div>
  );
}
