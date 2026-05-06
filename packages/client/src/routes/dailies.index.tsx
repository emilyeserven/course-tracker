import type { Daily } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FlameIcon, PlusIcon } from "lucide-react";

import { ContentBox, ContentBoxBody, ContentBoxFooter, ContentBoxHeader, ContentBoxHeaderBar, ContentBoxTitle } from "@/components/boxes/ContentBox";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchDailies } from "@/utils";

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

function shiftDateKey(key: string, deltaDays: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function getCurrentChain(daily: Daily): number {
  const todayKey = new Date().toISOString().slice(0, 10);
  const completedDates = new Set(
    daily.completions
      .filter(c => c.status !== "incomplete")
      .map(c => c.date),
  );

  let cursor = todayKey;
  if (!completedDates.has(cursor)) {
    cursor = shiftDateKey(cursor, -1);
    if (!completedDates.has(cursor)) {
      return 0;
    }
  }

  let count = 0;
  while (completedDates.has(cursor)) {
    count++;
    cursor = shiftDateKey(cursor, -1);
  }
  return count;
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
  const chain = getCurrentChain(daily);
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
