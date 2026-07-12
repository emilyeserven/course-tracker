import type { EntityStatus } from "@emstack/types";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ResourceProgress {
  progressCurrent?: number | null;
  progressTotal?: number | null;
  status?: EntityStatus | null;
}

interface ContentBoxProgressProps extends ResourceProgress {
  isRounded?: boolean;
}
export function ProgressBar({
  className,
  progressCurrent = 0,
  progressTotal = 0,
  status,
  isRounded = true,
  ...props
}: React.ComponentProps<"div"> & ContentBoxProgressProps) {
  if (!progressCurrent || !progressTotal) {
    return <></>;
  }
  return (
    <div
      className={cn("-mt-2 w-full rounded-br bg-muted", className)}
      {...props}
    >
      <div
        className={cn("h-2", {
          "bg-primary/50": status && status === "inactive",
          "bg-primary": !(status && status === "inactive"),
          "rounded-bl": isRounded,
        })}
        style={{
          width: `${progressCurrent !== 0 ? (progressCurrent / progressTotal) * 100 : 0}%`,
        }}
      />
    </div>
  );
}
