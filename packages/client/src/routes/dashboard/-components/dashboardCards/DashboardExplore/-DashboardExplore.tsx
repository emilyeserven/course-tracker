import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type { ExploreItem } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { ExploreItemList } from "./-ExploreItemList";
import {
  CardSettingsFlyout,
  DashboardCard,
  DashboardSectionStatus,
  isAutoHeight,
  queryKeys,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../DashboardCard/-cardKit";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExploreRing } from "@/hooks/useExploreRing";
import { fetchDomains, fetchExplore, fetchSettings } from "@/utils";

const ALL_TAB = "all";

export function DashboardExplore({
  tile, onUpdateTile,
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
  const domainTitleById = new Map((domains ?? []).map(d => [d.id, d.title]));
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
      action={
        rings.length > 0
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
          : null
      }
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
            <ExploreItemList
              items={itemsInRing}
              showDomain
            />
          )}
        </TabsContent>

        {focusedDomains.map((d) => {
          const domainItems = itemsInRing.filter(
            item => item.domainId === d.id,
          );
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
                <ExploreItemList
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
