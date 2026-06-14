import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchDomains, fetchSettings, updateSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

/**
 * Settings + domains queries plus the save mutation for the focused-domains
 * section. The section calls this once and hands `saveMutation` down to the
 * form, so neither component imports react-query/toast/data helpers directly.
 */
export function useFocusedDomains() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });
  const domainsQuery = useQuery({
    queryKey: queryKeys.domains.list(),
    queryFn: () => fetchDomains(),
  });

  const saveMutation = useMutation({
    mutationFn: (focusedDomainIds: string[]) =>
      updateSettings({
        focusedDomainIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
      toast.success("Focused domains saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    settingsQuery,
    domainsQuery,
    saveMutation,
  };
}
