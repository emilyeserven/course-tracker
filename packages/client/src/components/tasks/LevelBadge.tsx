import type { TaskResourceLevel } from "@emstack/types";

import { getResourceLevelClass, getResourceLevelLabel } from "./resourceMeta";

import { Badge } from "@/components/ui/badge";

export function LevelBadge({
  level,
}: {
  level: TaskResourceLevel | null | undefined;
}) {
  return (
    <Badge
      variant="outline"
      className={getResourceLevelClass(level)}
    >
      {getResourceLevelLabel(level)}
    </Badge>
  );
}
