import type { DashboardTileProps } from "@/lib/dashboardTiles";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

import { ReadwiseArticleList } from "./-ReadwiseArticleList";
import {
  Button,
  DashboardIntegrationCard,
  DashboardSectionStatus,
  queryKeys,
  SettingsLink,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../DashboardCard/-cardKit";

import { fetchReadwiseReadingList } from "@/utils";

export function DashboardReadwise({
  tile, onUpdateTile,
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
    <DashboardIntegrationCard
      tile={tile}
      onUpdateTile={onUpdateTile}
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
      settingsLink={
        <SettingsLink className="text-sm">Set Readwise API key</SettingsLink>
      }
      configured={configured}
      isPending={isPending}
      error={error}
      connectPrompt={(
        <p className="text-sm text-muted-foreground">
          Add your Readwise API key in
          {" "}
          <SettingsLink>Settings</SettingsLink>
          {" "}
          to
          see your reading list.
        </p>
      )}
    >
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
            <ReadwiseArticleList
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
            <ReadwiseArticleList
              docs={unstarted}
              showProgress={false}
            />
          )}
        </TabsContent>
      </Tabs>
    </DashboardIntegrationCard>
  );
}
