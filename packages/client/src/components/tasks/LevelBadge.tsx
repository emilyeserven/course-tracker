import type { TaskResourceLevel } from "@emstack/types";

import { getResourceLevelClass, getResourceLevelLabel } from "./resourceMeta";

import { cn } from "@/lib/utils";

export function LevelBadge({
  level,
}: {
  level: TaskResourceLevel | null | undefined;
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
