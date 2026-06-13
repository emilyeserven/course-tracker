import type { DashboardTileProps } from "./-dashboardTileMeta";
import type { ReadwiseDocument } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { CardSettingsFlyout } from "./-DashboardCardSettings";
import { isAutoHeight } from "./-dashboardTileMeta";

import {
  DashboardCard,
  DashboardSectionStatus,
} from "@/components/boxes/DashboardCard";
import { Button } from "@/components/ui/button";
import { RadialProgress } from "@/components/ui/RadialProgress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { fetchReadwiseReadingList } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

function readingTime(wordCount: number | null): string | null {
  if (!wordCount || wordCount <= 0) return null;
  // ~200 words per minute is the usual reading-speed estimate.
  return `${Math.max(1, Math.round(wordCount / 200))} min`;
}

function ArticleMeta({
  doc,
}: { doc: ReadwiseDocument }) {
  const parts = [doc.author, doc.siteName, readingTime(doc.wordCount)].filter(
    (part): part is string => Boolean(part),
  );
  if (parts.length === 0) return null;
  return (
    <span className="truncate text-xs text-muted-foreground">
      {parts.join(" · ")}
    </span>
  );
}

function ArticleList({
  docs,
  showProgress,
}: {
  docs: ReadwiseDocument[];
  showProgress: boolean;
}) {
  return (
    <ul className="flex flex-col divide-y">
      {docs.map(doc => (
        <li
          key={doc.id}
          className="flex flex-row items-center gap-2 py-2"
        >
          {showProgress && (
            <RadialProgress
              current={Math.round(doc.readingProgress * 100)}
              total={100}
              size={20}
            />
          )}
          <div className="flex min-w-0 flex-col">
            {doc.url
              ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    truncate font-medium
                    hover:text-blue-600
                  "
                >
                  {doc.title}
                </a>
              )
              : <span className="truncate font-medium">{doc.title}</span>}
            <ArticleMeta doc={doc} />
          </div>
          {!!doc.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Open article"
              className="
                ml-auto text-muted-foreground
                hover:text-foreground
              "
            >
              <ExternalLink className="size-4" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export function DashboardReadwise({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const {
    data, isPending, error,
  } = useQuery({
    queryKey: queryKeys.readwise.readingList(),
    queryFn: () => fetchReadwiseReadingList(),
    staleTime: 5 * 60 * 1000,
  });

  const configured = data?.configured ?? false;
  const started = data?.started ?? [];
  const unstarted = data?.unstarted ?? [];

  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title="Readwise"
      action={(
        <Button
          asChild
          size="sm"
          variant="outline"
        >
          <a
            href="https://read.readwise.io"
            target="_blank"
            rel="noreferrer"
          >
            Open Reader
            <ExternalLink />
          </a>
        </Button>
      )}
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        >
          <Link
            to="/settings"
            className="
              text-sm text-primary underline-offset-2
              hover:underline
            "
          >
            Set Readwise API key
          </Link>
        </CardSettingsFlyout>
      )}
    >
      {!isPending && !error && !configured
        ? (
          <p className="text-sm text-muted-foreground">
            Add your Readwise API key in
            {" "}
            <Link
              to="/settings"
              className="
                text-primary underline-offset-2
                hover:underline
              "
            >
              Settings
            </Link>
            {" "}
            to see your reading list.
          </p>
        )
        : (
          <Tabs defaultValue="started">
            <TabsList className="h-8">
              <TabsTrigger
                value="started"
                className="text-xs"
              >
                In progress
              </TabsTrigger>
              <TabsTrigger
                value="unstarted"
                className="text-xs"
              >
                Unread
              </TabsTrigger>
            </TabsList>
            <TabsContent value="started">
              <DashboardSectionStatus
                isPending={isPending}
                error={error}
                isEmpty={configured && started.length === 0}
                entity="articles"
                emptyMessage="No articles in progress."
              />
              {started.length > 0 && (
                <ArticleList
                  docs={started}
                  showProgress
                />
              )}
            </TabsContent>
            <TabsContent value="unstarted">
              <DashboardSectionStatus
                isPending={isPending}
                error={error}
                isEmpty={configured && unstarted.length === 0}
                entity="articles"
                emptyMessage="No unread articles."
              />
              {unstarted.length > 0 && (
                <ArticleList
                  docs={unstarted}
                  showProgress={false}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
    </DashboardCard>
  );
}
