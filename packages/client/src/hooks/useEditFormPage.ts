import type { QueryKey } from "@tanstack/react-query";

import { useCallback, useRef } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseEditFormPageOptions<TData> {
  id: string;
  isNew: boolean;
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  /** Extra query keys to invalidate after a successful save or delete. */
  relatedQueryKeys?: QueryKey[];
}

interface MakeDeleteHandlerOptions {
  deleteFn: (id: string) => Promise<unknown>;
  entityLabel: string;
  navigateToList: () => void | Promise<void>;
}

/**
 * Shared boilerplate for entity edit pages:
 *   - fetches the entity via useQuery (skipped when isNew)
 *   - manages the "skip unsaved-changes blocker" ref
 *   - exposes invalidateRelated() to refresh list/detail caches
 *   - exposes makeDeleteHandler(...) that wires up delete + invalidate + nav
 *
 * Navigation stays in the route file so TanStack Router types are preserved.
 */
export function useEditFormPage<TData>({
  id,
  isNew,
  queryKey,
  queryFn,
  relatedQueryKeys = [],
}: UseEditFormPageOptions<TData>) {
  const queryClient = useQueryClient();
  const skipBlocker = useRef(false);

  const {
    data,
  } = useQuery({
    queryKey,
    queryFn,
    enabled: !isNew,
  });

  const invalidateRelated = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey,
    });
    for (const key of relatedQueryKeys) {
      await queryClient.invalidateQueries({
        queryKey: key,
      });
    }
  }, [queryClient, queryKey, relatedQueryKeys]);

  const skipBlock = useCallback(() => {
    skipBlocker.current = true;
  }, []);

  const shouldBlockFn = useCallback(
    (hasChanges: boolean) => () => hasChanges && !skipBlocker.current,
    [],
  );

  const makeDeleteHandler = useCallback(
    ({
      deleteFn,
      entityLabel,
      navigateToList,
    }: MakeDeleteHandlerOptions) =>
      async () => {
        try {
          await deleteFn(id);
          await invalidateRelated();
          skipBlock();
          await navigateToList();
        }
        catch {
          toast.error(`Failed to delete ${entityLabel}. Please try again.`);
        }
      },
    [id, invalidateRelated, skipBlock],
  );

  return {
    data,
    queryClient,
    skipBlock,
    invalidateRelated,
    shouldBlockFn,
    makeDeleteHandler,
  };
}
