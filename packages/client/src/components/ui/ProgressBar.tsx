import type { CourseStatus } from "@emstack/types/src";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ContentBoxProgressProps {
  progressCurrent?: number;
  progressTotal?: number;
  status?: CourseStatus;
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
  if (!progressCurrent || progressCurrent === 0 || progressTotal === 0) {
    return <></>;
  }
  return (
    <div
      className={cn("-mt-2 w-full rounded-br bg-gray-50", className)}
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
