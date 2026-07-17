import type { Daily, DailyCompletionStatus } from "@emstack/types";

import { DailyActiveRow } from "./DailyActiveRow";

interface DailiesActiveListViewProps {
  dailies: Daily[];
  todayKey: string;
  onChangeStatus: (
    daily: Daily,
    status: DailyCompletionStatus,
    note: string | null,
  ) => void;
  mutationPending: boolean;
  recentDaysCount?: number;
}

export function DailiesActiveListView({
  dailies,
  todayKey,
  onChangeStatus,
  mutationPending,
  recentDaysCount = 6,
}: DailiesActiveListViewProps) {
  return (
    <ul
      className="
        grid grid-cols-1 gap-x-6 divide-y
        lg:grid-cols-2 lg:divide-y-0
      "
    >
      {dailies.map(daily => (
        <DailyActiveRow
          key={daily.id}
          daily={daily}
          todayKey={todayKey}
          onChangeStatus={onChangeStatus}
          mutationPending={mutationPending}
          recentDaysCount={recentDaysCount}
        />
      ))}
    </ul>
  );
}
