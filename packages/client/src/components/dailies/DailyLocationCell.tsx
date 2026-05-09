import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";

import { isHttpUrl } from "@/utils/isHttpUrl";

interface DailyLocationCellProps {
  location?: string | null;
  taskId?: string | null;
}

const goButtonClasses = `
  inline-flex items-center gap-1 rounded-md border border-input
  bg-background px-2 py-1 text-xs font-medium text-foreground
  hover:bg-accent hover:text-accent-foreground
`;

export function DailyLocationCell({
  location,
  taskId,
}: DailyLocationCellProps) {
  if (taskId) {
    return (
      <Link
        to="/tasks/$id"
        params={{
          id: taskId,
        }}
        className={goButtonClasses}
        title="Go to linked task"
      >
        Go
        <ChevronRightIcon className="size-3.5" />
      </Link>
    );
  }

  if (!location) {
    return null;
  }

  if (isHttpUrl(location)) {
    return (
      <a
        href={location}
        target="_blank"
        rel="noreferrer"
        className={goButtonClasses}
      >
        Go
        <ChevronRightIcon className="size-3.5" />
      </a>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">{location}</span>
  );
}
