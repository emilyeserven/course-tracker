import type { CourseStatus } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  pageTitle?: string;
  pageSection?: "" | "courses" | "topics" | "providers";
  children?: React.ReactNode;
  progressCurrent?: number;
  progressTotal?: number;
  status?: CourseStatus;
}

export function PageHeader({
  pageTitle = "",
  pageSection = "",
  children,
  progressCurrent = 0,
  progressTotal = 0,
  status,
}: PageHeaderProps) {
  return (
    <div
      className={cn("mb-8 bg-gray-200 pt-4", {
        "pt-4": progressCurrent && progressCurrent !== 0,
        "py-4": !progressCurrent || progressCurrent === 0,
      })}
    >
      <div className="container">
        <div className="flex w-full flex-col items-start gap-1">
          {pageSection && (
            <div className="flex flex-row gap-3">
              {pageSection === "courses" && (
                <Link
                  to="/courses"
                  className="text-sm uppercase"
                >
                  Courses
                </Link>
              )}
              {pageSection === "topics" && (
                <Link
                  to="/topics"
                  className="text-sm uppercase"
                >
                  Topics
                </Link>
              )}
              {pageSection === "providers" && (
                <Link
                  to="/providers"
                  className="text-sm uppercase"
                >
                  Providers
                </Link>
              )}
            </div>
          )}
          <div
            className="m-auto flex w-full flex-row items-start justify-between"
          >
            <div>
              <h1 className="text-3xl">{pageTitle}</h1>
            </div>
            {children && (
              <div>
                {children}
              </div>
            )}
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
            className="mt-6 bg-gray-300"
          />
        )
        : <></>}
    </div>
  );
}
