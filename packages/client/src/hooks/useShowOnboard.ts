import { useQuery } from "@tanstack/react-query";

import { fetchResources, fetchProviders } from "@/utils";
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
    data: providersData,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const allLoaded = resourcesData !== undefined && providersData !== undefined;

  return !allLoaded || (!resourcesData?.length && !providersData?.length);
}
