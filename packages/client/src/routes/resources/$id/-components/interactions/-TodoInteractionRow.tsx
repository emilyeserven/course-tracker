import type { TodoInteraction } from "@emstack/types";

import { Link } from "@tanstack/react-router";

import { DailyStatusCircle } from "@/components/dailies/DailyStatusCircle";
import { getDailyStatusOption } from "@/components/dailies/dailyStatusMeta";
import { Badge } from "@/components/ui/badge";

// A read-only log row for a Task List todo completion whose linked resource is
// this resource. Shows the date, the todo's status, the todo name, and a link to
// its Task List. Internal to -ResourceInteractionsLog; not re-exported.
export function TodoInteractionRow({
  item,
}: { item: TodoInteraction }) {
  const statusOption = getDailyStatusOption(item.status);
  const showTodo = item.todoName && item.todoName !== item.taskName;
  return (
    <li className="flex flex-col gap-1 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <DailyStatusCircle
          status={item.status}
          size="sm"
          title={statusOption.label}
        />
        <span className="text-sm font-medium">{item.date}</span>
        <Badge
          variant="outline"
          className="bg-muted/40"
        >
          via task list
        </Badge>
        <Link
          to="/tasks/$id"
          params={{
            id: item.taskId,
          }}
          className={`
            ml-auto text-sm text-blue-800
            hover:text-blue-600
            dark:text-blue-300
          `}
        >
          {item.taskName}
        </Link>
      </div>
      {showTodo && (
        <p className="text-sm text-muted-foreground">{item.todoName}</p>
      )}
      {item.note && (
        <p className="text-sm text-muted-foreground">{item.note}</p>
      )}
    </li>
  );
}
