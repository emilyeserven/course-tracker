import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  CircleDashedIcon,
  CircleIcon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchDailies, upsertDaily } from "@/utils";

const STATUS_OPTIONS: {
  value: DailyCompletionStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "incomplete",
    label: "Incomplete",
    icon: <CircleIcon className="size-4" />,
  },
  {
    value: "touched",
    label: "Touched",
    icon: <CircleDashedIcon className="size-4" />,
  },
  {
    value: "goal",
    label: "Goal",
    icon: <CheckIcon className="size-4" />,
  },
  {
    value: "exceeded",
    label: "Exceeded",
    icon: <SparklesIcon className="size-4" />,
  },
];

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function findTodayStatus(daily: Daily, todayKey: string): DailyCompletionStatus {
  return (
    daily.completions.find(c => c.date === todayKey)?.status ?? "incomplete"
  );
}

export function DashboardDailies() {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();

  const {
    data: dailies, isPending, error,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
  });

  const mutation = useMutation({
    mutationFn: ({
      daily, status,
    }: { daily: Daily;
      status: DailyCompletionStatus; }) => {
      const others = daily.completions.filter(c => c.date !== todayKey);
      const completions = [
        ...others,
        {
          date: todayKey,
          status,
        },
      ];
      return upsertDaily(daily.id, {
        name: daily.name,
        location: daily.location ?? null,
        description: daily.description ?? null,
        completions,
        courseProviderId: daily.provider?.id ?? null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
      });
    },
    onError: () => {
      toast.error("Failed to update daily.");
    },
  });

  return (
    <DashboardCard title="Dailies">
      {isPending && (
        <p className="text-sm text-muted-foreground">Loading dailies...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">Failed to load dailies.</p>
      )}
      {dailies && dailies.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No dailies yet.</i>
        </p>
      )}
      {dailies && dailies.length > 0 && (
        <ul className="flex flex-col divide-y">
          {dailies.map((daily) => {
            const currentStatus = findTodayStatus(daily, todayKey);
            return (
              <li
                key={daily.id}
                className="flex flex-col gap-2 py-2"
              >
                <div
                  className="flex flex-row items-center justify-between gap-2"
                >
                  <span className="font-medium">{daily.name}</span>
                  {daily.provider && (
                    <span className="text-xs text-muted-foreground">
                      {daily.provider.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-row flex-wrap gap-1">
                  {STATUS_OPTIONS.map(opt => (
                    <Button
                      key={opt.value}
                      type="button"
                      size="sm"
                      variant={currentStatus === opt.value ? "default" : "outline"}
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({
                        daily,
                        status: opt.value,
                      })}
                      className={cn({
                        "ring-2 ring-ring": currentStatus === opt.value,
                      })}
                    >
                      {opt.icon}
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
