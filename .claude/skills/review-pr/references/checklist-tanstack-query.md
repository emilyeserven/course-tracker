# TanStack Query Checklist

- **`useQuery` for data fetching**: Data fetching uses `useQuery` with `queryKey` and `queryFn` — never `useEffect` + `fetch`
- **Query key conventions**: Follow the existing pattern: simple string arrays (`["courses"]`, `["course", id]`, `["providers"]`)
- **Mutations with invalidation**: `useMutation` with `onSuccess` that invalidates related query keys via `queryClient.invalidateQueries`
- **Loading and error states**: Handle `isPending`, `isError`, and `error` states from query hooks — or rely on route-level `pendingComponent`/`errorComponent`
- **No unnecessary refetching**: Avoid `refetchOnWindowFocus` or `refetchInterval` unless specifically needed for the use case
- **Conditional queries**: Use `enabled` option to conditionally run queries (project already uses `enabled: false` for manual control)
- **Cache configuration**: `staleTime` and `gcTime` should be set intentionally, not left at defaults for frequently-changing data
- **Prefetching**: Use `queryClient.prefetchQuery` in route loaders for faster navigation
- **Use Context7**: Verify query hook API usage against current TanStack Query docs when reviewing query changes
