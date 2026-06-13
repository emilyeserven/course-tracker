import type { DashboardTileProps } from "./-dashboardTileMeta";
import type { ExploreItem } from "@emstack/types";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { CardSettingsFlyout } from "./-DashboardCardSettings";
import { isAutoHeight } from "./-dashboardTileMeta";

import {
  DashboardCard,
  DashboardSectionStatus,
} from "@/components/boxes/DashboardCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useExploreRing } from "@/hooks/useExploreRing";
import { cn } from "@/lib/utils";
import { fetchDomains, fetchExplore, fetchSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

const ALL_TAB = "all";

// Two-line description with an inline toggle that expands the full text within
// the tile. Renders nothing when there's no description to show.
function ExploreItemDescription({
  description,
}: {
  description: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = description?.trim();
  if (!text) return null;

  return (
    <div className="text-xs text-muted-foreground">
      <p className={cn("whitespace-pre-wrap", !expanded && "line-clamp-2")}>
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        className="
          mt-0.5 font-medium text-primary underline-offset-2
          hover:underline
        "
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

function ItemList({
  items,
  showDomain,
}: {
  items: ExploreItem[];
  showDomain: boolean;
}) {
  return (
    <ul
      className="
        grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-2
      "
    >
      {items.map(item => (
        <li
          key={`${item.domainId}:${item.topicId}`}
          className="flex min-w-0 flex-col gap-1 rounded-md border p-2"
        >
          <div className="flex min-w-0 flex-col">
            <Link
              to="/topics/$id"
              params={{
                id: item.topicId,
              }}
              className="
                truncate font-medium
                hover:text-blue-600
              "
            >
              {item.topicName}
            </Link>
            {showDomain && (
              <span className="truncate text-xs text-muted-foreground">
                {item.domainTitle}
              </span>
            )}
          </div>
          <ExploreItemDescription description={item.description} />
        </li>
      ))}
    </ul>
  );
}

export function DashboardExplore({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const {
    data, isPending, error,
  } = useQuery({
    queryKey: queryKeys.domains.explore(),
    queryFn: () => fetchExplore(),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: settings,
  } = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });

  const {
    data: domains,
  } = useQuery({
    queryKey: queryKeys.domains.list(),
    queryFn: () => fetchDomains(),
  });

  const rings = data?.rings ?? [];
  const {
    ring, setRing,
  } = useExploreRing(data ? rings : undefined);

  // Focused domains (in saved order), limited to ones that still exist.
  const domainTitleById = new Map(
    (domains ?? []).map(d => [d.id, d.title]),
  );
  const focusedDomains = (settings?.focusedDomainIds ?? [])
    .filter(id => domainTitleById.has(id))
    .map(id => ({
      id,
      title: domainTitleById.get(id) ?? "",
    }));

  const matchesRing = (item: ExploreItem) =>
    item.ringName?.toLowerCase() === ring.toLowerCase();
  const itemsInRing = (data?.items ?? []).filter(matchesRing);

  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title="Explore Something"
      action={rings.length > 0
        ? (
          <Select
            value={ring}
            onValueChange={setRing}
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Ring" />
            </SelectTrigger>
            <SelectContent>
              {rings.map(r => (
                <SelectItem
                  key={r}
                  value={r}
                >
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
        : null}
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        />
      )}
    >
      <Tabs defaultValue={ALL_TAB}>
        <TabsList className="h-8">
          <TabsTrigger
            value={ALL_TAB}
            className="text-xs"
          >
            All Domains
          </TabsTrigger>
          {focusedDomains.map(d => (
            <TabsTrigger
              key={d.id}
              value={d.id}
              className="text-xs"
            >
              {d.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {focusedDomains.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {"Set "}
            <Link
              to="/settings"
              className="
                text-primary underline-offset-2
                hover:underline
              "
            >
              focused domains
            </Link>
            {" in settings to organize this by domain."}
          </p>
        )}

        <TabsContent value={ALL_TAB}>
          <DashboardSectionStatus
            isPending={isPending}
            error={error}
            isEmpty={!isPending && !error && itemsInRing.length === 0}
            entity="items"
            emptyMessage={`No items in the ${ring} ring.`}
          />
          {itemsInRing.length > 0 && (
            <ItemList
              items={itemsInRing}
              showDomain
            />
          )}
        </TabsContent>

        {focusedDomains.map((d) => {
          const domainItems = itemsInRing.filter(item => item.domainId === d.id);
          return (
            <TabsContent
              key={d.id}
              value={d.id}
            >
              <DashboardSectionStatus
                isPending={isPending}
                error={error}
                isEmpty={!isPending && !error && domainItems.length === 0}
                entity="items"
                emptyMessage={`No items in the ${ring} ring.`}
              />
              {domainItems.length > 0 && (
                <ItemList
                  items={domainItems}
                  showDomain={false}
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </DashboardCard>
  );
}
