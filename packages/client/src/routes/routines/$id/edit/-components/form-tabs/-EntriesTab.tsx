import { useQuery } from "@tanstack/react-query";

import { DailyCompletionsManager } from "@/components/dailies/DailyCompletionsManager";
import { EntityError, EntityPending } from "@/components/listControls/EntityStates";
import { fetchSingleDaily } from "@/utils";

interface EntriesTabProps {
  id: string;
}

/**
 * A routine and a daily are the same entity by id, so we read the daily
 * projection and reuse the self-saving completions manager. It persists each
 * change on its own (no separate Save button), exactly as on the View page.
 */
export function EntriesTab({
  id,
}: EntriesTabProps) {
  const {
    isPending, error, data,
  } = useQuery({
    queryKey: ["daily", id],
    queryFn: () => fetchSingleDaily(id),
  });

  if (isPending) {
    return <EntityPending entity="daily" />;
  }

  if (error || !data) {
    return <EntityError entity="daily" />;
  }

  return (
    <DailyCompletionsManager
      daily={data}
      readOnly={data.status !== "active"}
    />
  );
}
