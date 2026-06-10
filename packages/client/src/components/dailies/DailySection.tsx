import { useEffect, useState } from "react";

import { EditIcon, ExternalLink } from "lucide-react";

import { DailyDetailsPanel } from "./DailyDetailsPanel";
import { DailyEditDialog } from "./DailyEditDialog";

import { Button } from "@/components/ui/button";
import { isHttpUrl } from "@/utils";

interface DailySectionDaily {
  id: string;
  name: string;
  location?: string | null;
  status?: string | null;
}

export type DailySectionAutoOpenMode = "view" | "edit" | null | undefined;

interface DailySectionProps {
  daily: DailySectionDaily;
  lockedTaskId?: string;
  lockedResourceId?: string;
  /**
   * If "edit", open the edit dialog on mount. If "view", expand the inline
   * details panel on mount. Should be cleared by the caller after consumption.
   */
  autoOpenMode?: DailySectionAutoOpenMode;
  onAutoOpenConsumed?: () => void;
}

export function DailySection({
  daily,
  lockedTaskId,
  lockedResourceId,
  autoOpenMode,
  onAutoOpenConsumed,
}: DailySectionProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (autoOpenMode === "edit") {
      setEditOpen(true);
      onAutoOpenConsumed?.();
    }
    else if (autoOpenMode === "view") {
      setExpanded(true);
      onAutoOpenConsumed?.();
    }
    // Only run when autoOpenMode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenMode]);

  const locationIsUrl = !!daily.location && isHttpUrl(daily.location);

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-4">
      <div
        className="flex flex-row flex-wrap items-center justify-between gap-2"
      >
        <div className="flex flex-row items-center gap-2">
          <h3 className="text-lg font-semibold">
            Daily:
            {" "}
            {daily.name}
            {daily.status === "complete" ? " (completed)" : ""}
            {daily.status === "paused" ? " (paused)" : ""}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(prev => !prev)}
          >
            {expanded ? "Hide details" : "Show details"}
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          {locationIsUrl && daily.location && (
            <a
              href={daily.location}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
              >
                Open Location
                <ExternalLink />
              </Button>
            </a>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            Edit Daily
            <EditIcon />
          </Button>
        </div>
      </div>
      {expanded && <DailyDetailsPanel dailyId={daily.id} />}
      <DailyEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        id={daily.id}
        isNew={false}
        lockedTaskId={lockedTaskId}
        lockedResourceId={lockedResourceId}
      />
    </div>
  );
}
