import * as React from "react";

import { cn } from "@/lib/utils";

interface DashboardCardProps extends React.ComponentProps<"section"> {
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

export { DashboardCard };
