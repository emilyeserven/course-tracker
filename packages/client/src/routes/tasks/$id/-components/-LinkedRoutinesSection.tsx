import type { Routine } from "@emstack/types";

import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * "Routines" section body for a task: the routines that include this task, or a
 * dashed empty state with a CTA to create one.
 */
export function LinkedRoutinesSection({
  routines,
  taskId,
}: {
  routines: Routine[];
  taskId: string;
}) {
  if (routines.length === 0) {
    return (
      <div
        className="
          flex flex-row items-center justify-between gap-2 rounded-md border
          border-dashed bg-card p-4
        "
      >
        <span className="text-sm text-muted-foreground">
          No routines include this task.
        </span>
        <Link
          to="/routines/$id/edit"
          params={{
            id: "new",
          }}
          search={{
            mode: "daily",
            entryType: "task",
            entryId: taskId,
          }}
        >
          <Button>
            <PlusIcon />
            Create Routine for this Task
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {routines.map(r => (
        <li
          key={r.id}
          className="
            flex flex-row items-center justify-between gap-2 rounded-md border
            bg-card p-3
          "
        >
          <Link
            to="/routines/$id"
            params={{
              id: r.id,
            }}
            className="
              font-medium
              hover:text-blue-600
            "
          >
            {r.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {r.mode === "daily" ? "Daily" : "Weekly"}
          </span>
        </li>
      ))}
    </ul>
  );
}
