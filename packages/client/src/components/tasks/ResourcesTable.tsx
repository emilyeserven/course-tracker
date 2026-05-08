import type { Resource, Task } from "@emstack/types/src";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

import { getResourceLevelClass, getResourceLevelLabel } from "./resourceMeta";

import { cn } from "@/lib/utils";
import { isHttpUrl, upsertTask } from "@/utils";

interface ResourcesTableProps {
  task: Task;
}

function LevelBadge({
  level,
}: {
  level: Resource["easeOfStarting"];
}) {
  return (
    <span
      className={cn(
        `
          inline-flex items-center rounded-full border px-2 py-0.5 text-xs
          font-medium
        `,
        getResourceLevelClass(level),
      )}
    >
      {getResourceLevelLabel(level)}
    </span>
  );
}

export function ResourcesTable({
  task,
}: ResourcesTableProps) {
  const queryClient = useQueryClient();
  const resources = task.resources ?? [];

  const mutation = useMutation({
    mutationFn: (next: Resource[]) =>
      upsertTask(task.id, {
        name: task.name,
        description: task.description ?? null,
        topicId: task.topicId ?? null,
        resources: next.map(r => ({
          id: r.id,
          name: r.name,
          url: r.url ?? null,
          easeOfStarting: r.easeOfStarting ?? null,
          timeNeeded: r.timeNeeded ?? null,
          interactivity: r.interactivity ?? null,
          usedYet: r.usedYet,
        })),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["task", task.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        }),
      ]);
    },
    onError: () => {
      toast.error("Failed to update resource.");
    },
  });

  function handleToggleUsed(resourceId: string, nextUsed: boolean) {
    const next = resources.map(r =>
      r.id === resourceId
        ? {
          ...r,
          usedYet: nextUsed,
        }
        : r);
    mutation.mutate(next);
  }

  if (resources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        <i>No resources yet. Add some when you edit this task.</i>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="p-2 font-medium">Name</th>
            <th className="p-2 font-medium whitespace-nowrap">Ease of Starting</th>
            <th className="p-2 font-medium whitespace-nowrap">Time Needed</th>
            <th className="p-2 font-medium">Interactivity</th>
            <th className="p-2 font-medium whitespace-nowrap">Used yet?</th>
          </tr>
        </thead>
        <tbody>
          {resources.map(r => (
            <tr
              key={r.id}
              className="border-t"
            >
              <td className="p-2 align-top">
                {r.url && isHttpUrl(r.url)
                  ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex items-center gap-1 font-medium text-blue-700
                        hover:text-blue-500
                        dark:text-blue-300
                      "
                    >
                      {r.name}
                      <ExternalLinkIcon className="size-3.5" />
                    </a>
                  )
                  : (
                    <span className="font-medium">{r.name}</span>
                  )}
              </td>
              <td className="p-2 align-top">
                <LevelBadge level={r.easeOfStarting} />
              </td>
              <td className="p-2 align-top">
                <LevelBadge level={r.timeNeeded} />
              </td>
              <td className="p-2 align-top">
                <LevelBadge level={r.interactivity} />
              </td>
              <td className="p-2 align-top">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={r.usedYet}
                    disabled={mutation.isPending}
                    onChange={e => handleToggleUsed(r.id, e.target.checked)}
                    className="size-4"
                    aria-label={`Mark ${r.name} as used`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {r.usedYet ? "Used" : "Not yet"}
                  </span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
