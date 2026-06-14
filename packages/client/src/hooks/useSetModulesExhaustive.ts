import type { Resource } from "@emstack/types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { setResourceModulesExhaustive } from "@/utils/fetchFunctions";
import { queryKeys } from "@/utils/queryKeys";

/**
 * Toggle the resource-level "modules are exhaustive" flag (whether progress is
 * computed from finished modules instead of the manual current/total numbers).
 * Optimistic so the control responds instantly and rolls back on error, writing
 * to the shared `resources.detail` query so every reader — the Details-tab
 * progress radio and the Modules-tab callout — stays in sync across tabs.
 */
export function useSetModulesExhaustive(resourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: boolean) =>
      setResourceModulesExhaustive(resourceId, value),
    onMutate: async (value: boolean) => {
      const detailKey = queryKeys.resources.detail(resourceId);
      await queryClient.cancelQueries({
        queryKey: detailKey,
      });
      const previous = queryClient.getQueryData<Resource>(detailKey);
      if (previous) {
        queryClient.setQueryData<Resource>(detailKey, {
          ...previous,
          modulesAreExhaustive: value,
        });
      }
      return {
        previous,
      };
    },
    onError: (e: Error, _value, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.resources.detail(resourceId),
          context.previous,
        );
      }
      toast.error(e.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.resources.detail(resourceId),
      });
    },
  });
}
