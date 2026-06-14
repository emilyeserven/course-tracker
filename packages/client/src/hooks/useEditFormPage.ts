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

// Shared by the handlers that navigate to the affected entity after acting.
interface EntityNavHandlerOptions {
  entityLabel: string;
  navigateToEntity: (id: string) => void | Promise<void>;
}

interface MakeDuplicateHandlerOptions extends EntityNavHandlerOptions {
  duplicateFn: (id: string) => Promise<{ id: string }>;
}

interface MakeSubmitHandlerOptions<TPayload> extends EntityNavHandlerOptions {
  createFn: (data: TPayload) => Promise<{ id: string }>;
  upsertFn: (id: string, data: TPayload) => Promise<unknown>;
}

/**
 * Shared boilerplate for entity edit pages:
 *   - fetches the entity via useQuery (skipped when isNew)
 *   - manages the "skip unsaved-changes blocker" ref
 *   - exposes invalidateRelated() to refresh list/detail caches
 *   - exposes makeDeleteHandler(...) that wires up delete + invalidate + nav
 *   - exposes makeDuplicateHandler(...) that wires up duplicate + invalidate +
 *     nav to the new entity
 *   - exposes makeSubmitHandler(...) that wires up create/upsert + invalidate
 *     + nav + error toast; call the returned function from the form's
 *     onSubmit with the API payload
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
      deleteFn, entityLabel, navigateToList,
    }: MakeDeleteHandlerOptions) =>
      async () => {
        try {
          await deleteFn(id);
          await invalidateRelated();
          skipBlock();
          await navigateToList();
          toast.success(
            `${entityLabel.charAt(0).toUpperCase()}${entityLabel.slice(1)} deleted.`,
          );
        }
        catch {
          toast.error(`Failed to delete ${entityLabel}. Please try again.`);
        }
      },
    [id, invalidateRelated, skipBlock],
  );

  const makeDuplicateHandler = useCallback(
    ({
      duplicateFn,
      entityLabel,
      navigateToEntity,
    }: MakeDuplicateHandlerOptions) =>
      async () => {
        try {
          const result = await duplicateFn(id);
          await invalidateRelated();
          skipBlock();
          await navigateToEntity(result.id);
        }
        catch {
          toast.error(`Failed to duplicate ${entityLabel}. Please try again.`);
        }
      },
    [id, invalidateRelated, skipBlock],
  );

  const makeSubmitHandler = useCallback(
    <TPayload>({
      createFn,
      upsertFn,
      entityLabel,
      navigateToEntity,
    }: MakeSubmitHandlerOptions<TPayload>) =>
      async (payload: TPayload) => {
        try {
          let entityId = id;
          if (isNew) {
            const result = await createFn(payload);
            entityId = result.id;
          }
          else {
            await upsertFn(id, payload);
          }
          await invalidateRelated();
          skipBlock();
          await navigateToEntity(entityId);
        }
        catch {
          toast.error(
            isNew
              ? `Failed to create ${entityLabel}. Please try again.`
              : `Failed to save ${entityLabel}. Please try again.`,
          );
        }
      },
    [id, isNew, invalidateRelated, skipBlock],
  );

  return {
    data,
    queryClient,
    skipBlock,
    invalidateRelated,
    shouldBlockFn,
    makeDeleteHandler,
    makeDuplicateHandler,
    makeSubmitHandler,
  };
}
