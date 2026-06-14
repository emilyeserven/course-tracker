import type { RoutineInteraction } from "@emstack/types";

import { DailyStatusCircle } from "@/components/dailies/DailyStatusCircle";
import { getDailyStatusOption } from "@/components/dailies/dailyStatusMeta";
import { Badge } from "@/components/ui/badge";

// A read-only log row for a routine completion that touched this resource. Shows
// the date, the routine, the completion status, and (when known) the specific
// scheduled action and whether it touched the resource directly or via a task.
// Internal to -ResourceInteractionsLog; not re-exported from the folder barrel.
export function RoutineInteractionRow({
  item,
}: { item: RoutineInteraction }) {
  const statusOption = getDailyStatusOption(item.status);
  const showAction = item.actionLabel && item.actionLabel !== item.routineName;
  return (
    <li className="flex flex-col gap-1 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <DailyStatusCircle
          status={item.status}
          size="sm"
          title={statusOption.label}
        />
        <span className="text-sm font-medium">{item.date}</span>
        {item.via === "task" && (
          <Badge
            variant="outline"
            className="bg-muted/40"
          >
            via task
          </Badge>
        )}
        <span className="ml-auto text-sm">{item.routineName}</span>
      </div>
      {showAction && (
        <p className="text-sm text-muted-foreground">{item.actionLabel}</p>
      )}
      {item.note && (
        <p className="text-sm text-muted-foreground">{item.note}</p>
      )}
    </li>
  );
}
