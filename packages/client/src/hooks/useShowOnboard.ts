import { useQuery } from "@tanstack/react-query";

import {
  fetchResources,
  fetchDomains,
  fetchProviders,
  fetchTopics,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

/**
 * Whether the app shell should surface the Onboard nav link — true until the
 * core record types have loaded and at least one record exists.
 */
export function useShowOnboard(): boolean {
  const {
    data: resourcesData,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });

  const {
    data: topicsData,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: providersData,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const {
    data: domainsData,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  const allLoaded
    = resourcesData !== undefined
      && topicsData !== undefined
      && providersData !== undefined
      && domainsData !== undefined;

  return (
    !allLoaded
    || (!resourcesData?.length
      && !topicsData?.length
      && !providersData?.length
      && !domainsData?.length)
  );
}
