import type { TaskResourceLevel } from "@emstack/types";

import { cn } from "@/lib/utils";
import { changedFieldClass } from "@/utils";

export type LevelValue = "" | TaskResourceLevel;

export function LevelSelectRow({
  label,
  value,
  onChange,
  changed,
}: {
  label: string;
  value: LevelValue;
  onChange: (next: LevelValue) => void;
  changed?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1", changed && changedFieldClass)}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as LevelValue)}
        className="
          flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm
        "
      >
        <option value="">—</option>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
      </select>
    </div>
  );
}
