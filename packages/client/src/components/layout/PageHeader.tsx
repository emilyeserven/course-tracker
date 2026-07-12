import type { EntityKind } from "@/components/boxElements/EntityLink";
import type { ResourceProgress } from "@/components/ui/ProgressBar";

import { Link } from "@tanstack/react-router";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends ResourceProgress {
  pageTitle?: string;
  pageSection?: EntityKind | "dailies" | "routines" | "";
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  pageTitle = "",
  pageSection = "",
  description,
  children,
  progressCurrent = 0,
  progressTotal = 0,
  status,
}: PageHeaderProps) {
  return (
    <div
      className={cn("mb-8 bg-muted pt-4", {
        "pt-4": progressCurrent && progressCurrent !== 0,
        "py-4": !progressCurrent || progressCurrent === 0,
      })}
    >
      <div className="container">
        <div className="flex w-full flex-col items-start gap-1">
          {pageSection && (
            <div className="flex flex-row gap-3">
              {pageSection === "dailies" && (
                <Link
                  to="/routines/tracker"
                  className="text-sm uppercase"
                >
                  Dailies
                </Link>
              )}
              {pageSection === "routines" && (
                <Link
                  to="/routines"
                  className="text-sm uppercase"
                >
                  Routines
                </Link>
              )}
              {pageSection === "tasks" && (
                <Link
                  to="/tasks"
                  className="text-sm uppercase"
                >
                  Tasks
                </Link>
              )}
            </div>
          )}
          <div
            className="
              m-auto flex w-full flex-col items-start gap-2
              sm:flex-row sm:justify-between
            "
          >
            <div>
              <h1 className="text-3xl">{pageTitle}</h1>
              {description && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {children && <div>{children}</div>}
          </div>
        </div>
      </div>
      {progressCurrent && progressCurrent !== 0
        ? (
          <ProgressBar
            progressCurrent={progressCurrent}
            progressTotal={progressTotal}
            status={status}
            isRounded={false}
            className="mt-6 bg-muted-foreground/20"
          />
        )
        : (
          <></>
        )}
    </div>
  );
}
