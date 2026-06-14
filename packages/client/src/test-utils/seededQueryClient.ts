import type { QueryKey } from "@tanstack/react-query";

import { QueryClient } from "@tanstack/react-query";

/**
 * Builds a QueryClient pre-seeded for stories/tests: retries off and
 * staleTime Infinity so seeded data never refetches, then each [key, data]
 * pair is written via setQueryData. Replaces the per-story hand-rolled
 * seededClient / clientWith / buildClient wrappers.
 */
export function seededQueryClient(
  entries: readonly (readonly [QueryKey, unknown])[] = [],
): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  for (const [key, data] of entries) {
    client.setQueryData(key, data);
  }
  return client;
}
