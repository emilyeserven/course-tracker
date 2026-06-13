import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Wraps `children` in a TanStack Query context so components that call
 * `useMutation`/`useQueryClient`/`useQuery` can render in isolation (stories and
 * tests). Retries are disabled so failed fetches settle immediately.
 *
 * Pass a pre-configured `client` to seed the cache via `setQueryData` (e.g. for
 * components that read a single entity through `useQuery`); otherwise a fresh
 * client is created per render.
 */
export function QueryStub({
  children,
  client,
}: {
  children: ReactNode;
  client?: QueryClient;
}) {
  const queryClient
    = client
      ?? new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
