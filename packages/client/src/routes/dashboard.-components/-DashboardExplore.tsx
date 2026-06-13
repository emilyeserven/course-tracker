import type { ExploreItem } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

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
import { fetchDomains, fetchExplore, fetchSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

const ALL_TAB = "all";

function ItemList({
  items,
  showDomain,
}: {
  items: ExploreItem[];
  showDomain: boolean;
}) {
  return (
    <ul className="flex flex-col divide-y">
      {items.map(item => (
        <li
          key={`${item.domainId}:${item.topicId}`}
          className="flex flex-row items-center gap-2 py-2"
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
        </li>
      ))}
    </ul>
  );
}

export function DashboardExplore() {
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
