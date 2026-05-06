import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FlameIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { ContentBox, ContentBoxBody, ContentBoxFooter, ContentBoxHeader, ContentBoxHeaderBar, ContentBoxTitle } from "@/components/boxes/ContentBox";
import { DailyRecentDaysStrip, DailyStatusButtons } from "@/components/dailies";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  fetchDailies,
  findStatusForDate,
  getCurrentChain,
  getTodayKey,
  upsertDaily,
  withCompletion,
} from "@/utils";

export const Route = createFileRoute("/dailies/")({
  component: Dailies,
  errorComponent: DailiesError,
  pendingComponent: DailiesPending,
});

function DailiesPending() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">Hold on, loading your dailies...</h1>
    </div>
  );
}

function DailiesError() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">There was an error loading your dailies.</h1>
    </div>
  );
}

function Dailies() {
  const {
    data,
  } = useQuery({
    queryKey: ["dailies"],
    queryFn: () => fetchDailies(),
  });

  return (
    <div>
      <PageHeader
        pageTitle="Dailies"
        pageSection=""
      />
      <div className="container">
        <div className="card-grid">
          {(!data || data.length === 0) && (
            <div className="flex flex-col gap-6">
              <i>No dailies yet!</i>
            </div>
          )}

          {data
            && data.length > 0
            && data.map(daily => (
              <DailyBox
                daily={daily}
                key={daily.id}
              />
            ))}

          <Link
            to="/dailies/$id/edit"
            params={{
              id: "new",
            }}
          >
            <ContentBox
              className="
                h-full items-center justify-center border-dashed p-8
                text-muted-foreground transition-colors
                hover:border-solid hover:bg-accent hover:text-accent-foreground
              "
            >
              <PlusIcon size={32} />
              <span className="text-lg font-medium">Add New Daily</span>
            </ContentBox>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DailyBox({
  daily,
}: { daily: Daily }) {
  const queryClient = useQueryClient();
  const todayKey = getTodayKey();
  const chain = getCurrentChain(daily, todayKey);
  const currentStatus = findStatusForDate(daily, todayKey);

  const mutation = useMutation({
    mutationFn: (status: DailyCompletionStatus) => {
      const completions = withCompletion(daily, todayKey, status);
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
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar />
        <ContentBoxTitle>
          <h3 className="text-2xl">
            <Link
              to="/dailies/$id"
              from="/dailies"
              params={{
                id: daily.id,
              }}
              className="hover:text-blue-600"
            >
              {daily.name}
            </Link>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <p>
          {daily.description ? daily.description : <i>No description provided.</i>}
        </p>
        <DailyRecentDaysStrip daily={daily} />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase">
            Today&apos;s status
          </span>
          <DailyStatusButtons
            currentStatus={currentStatus}
            disabled={mutation.isPending}
            onChange={status => mutation.mutate(status)}
          />
        </div>
      </ContentBoxBody>
      <ContentBoxFooter>
        <span
          className={
            chain > 0
              ? "inline-flex items-center gap-1 text-sm text-orange-600"
              : "inline-flex items-center gap-1 text-sm text-muted-foreground"
          }
          title={chain > 0 ? `${chain}-day chain` : "No active chain"}
        >
          <FlameIcon size={16} />
          {chain}
        </span>
        {daily.provider && (
          <span className="text-sm text-muted-foreground">
            {daily.provider.name}
          </span>
        )}
      </ContentBoxFooter>
    </ContentBox>
  );
}
