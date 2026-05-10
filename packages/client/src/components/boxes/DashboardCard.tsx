import * as React from "react";

import { cn } from "@/lib/utils";

interface DashboardCardProps
  extends Omit<React.ComponentProps<"section">, "title"> {
  title: React.ReactNode;
  action?: React.ReactNode;
}

function DashboardCard({
  className,
  title,
  action,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <section
      className={cn(`
        flex flex-col gap-3 rounded-md border bg-card text-card-foreground
        shadow-sm
      `, className)}
      {...props}
    >
      <header
        className="
          flex flex-row items-center justify-between gap-2 border-b bg-border
          px-3 py-2
        "
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {action ? <div className="flex items-center gap-1">{action}</div> : null}
      </header>
      <div className="flex flex-col gap-2 px-3 pb-3">{children}</div>
    </section>
  );
}

interface DashboardSectionStatusProps {
  isPending?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  /** Plural noun used in the loading + error messages, e.g. "courses". */
  entity: string;
  /** Italic text shown when `isEmpty` is true (after data has loaded). */
  emptyMessage: string;
}

/**
 * Inline pending/error/empty status row for a `DashboardCard` body. Returns
 * `null` once data has loaded and the section has rows to render.
 */
function DashboardSectionStatus({
  isPending,
  error,
  isEmpty,
  entity,
  emptyMessage,
}: DashboardSectionStatusProps) {
  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading
        {" "}
        {entity}
        ...
      </p>
    );
  }
  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load
        {" "}
        {entity}
        .
      </p>
    );
  }
  if (isEmpty) {
    return (
      <p className="text-sm text-muted-foreground">
        <i>{emptyMessage}</i>
      </p>
    );
  }
  return null;
}

export { DashboardCard, DashboardSectionStatus };
