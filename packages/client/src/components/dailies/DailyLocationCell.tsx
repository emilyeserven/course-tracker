import { ChevronRightIcon } from "lucide-react";

import { isHttpUrl } from "@/utils/isHttpUrl";

interface DailyLocationCellProps {
  location?: string | null;
}

export function DailyLocationCell({
  location,
}: DailyLocationCellProps) {
  if (!location) {
    return null;
  }

  if (isHttpUrl(location)) {
    return (
      <a
        href={location}
        target="_blank"
        rel="noreferrer"
        className="
          inline-flex items-center gap-1 rounded-md border border-input
          bg-background px-2 py-1 text-xs font-medium text-foreground
          hover:bg-accent hover:text-accent-foreground
        "
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
