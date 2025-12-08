import type { CourseStatus } from "@emstack/types/src";

import * as React from "react";

import { cn } from "@/lib/utils";

function ContentBox({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col justify-between gap-2 rounded border", className)}
      {...props}
    />
  );
}

function ContentBoxHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col justify-start", className)}
      {...props}
    />
  );
}

function ContentBoxHeaderBar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(`
        flex flex-row items-center justify-between border-b bg-border py-1 pr-1
        pl-2
      `, className)}
      {...props}
    />
  );
}

function ContentBoxTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-start justify-between px-2 pt-1", className)}
      {...props}
    />
  );
}

function ContentBoxBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(`
        flex h-full flex-col items-start justify-between gap-4 px-2
      `, className)}
      {...props}
    />
  );
}

function ContentBoxFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(`
        flex flex-row flex-wrap justify-between gap-8 gap-y-1 border-t
        bg-gray-50 px-2 pt-2 pb-2
      `, className)}
      {...props}
    />
  );
}

interface ContentBoxProgressProps {
  progressCurrent?: number;
  progressTotal?: number;
  status?: CourseStatus;
}

function ContentBoxProgress({
  className,
  progressCurrent,
  progressTotal = 0,
  status,
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
        className={`
          ${status && status === "inactive"
      ? "bg-primary/50"
      : "bg-primary"}
          h-2 rounded-bl
        `}
        style={{
          width: `${progressCurrent !== 0 ? progressTotal / progressCurrent : 0}%`,
        }}
      />
    </div>
  );
}

export { ContentBox, ContentBoxHeader, ContentBoxHeaderBar, ContentBoxTitle, ContentBoxBody, ContentBoxFooter, ContentBoxProgress };
