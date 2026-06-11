import type { Resolution, ResolvedLlmEntry } from "./blipLlmReview";
import type { RadarQuadrant, RadarRing } from "@emstack/types";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkEditBarProps {
  resolved: ResolvedLlmEntry[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  onBulkQuadrant: (quadrantId: string) => void;
  onBulkRing: (ringId: string) => void;
  onBulkResolution: (resolution: Resolution) => void;
  onClearDescriptions: () => void;
  onClearRadarNotes: () => void;
}

export function BulkEditBar({
  resolved,
  quadrants,
  rings,
  onBulkQuadrant,
  onBulkRing,
  onBulkResolution,
  onClearDescriptions,
  onClearRadarNotes,
}: BulkEditBarProps) {
  const [pendingQuadrant, setPendingQuadrant] = useState<string>("");
  const [pendingRing, setPendingRing] = useState<string>("");
  const [pendingResolution, setPendingResolution] = useState<string>("");

  const selectedCount = resolved.filter(r => r.selected).length;
  const anySelected = selectedCount > 0;

  function applyQuadrant() {
    if (!pendingQuadrant) {
      return;
    }
    onBulkQuadrant(pendingQuadrant);
    setPendingQuadrant("");
  }

  function applyRing() {
    if (!pendingRing) {
      return;
    }
    onBulkRing(pendingRing);
    setPendingRing("");
  }

  function applyResolution() {
    if (!pendingResolution) {
      return;
    }
    onBulkResolution(pendingResolution as Resolution);
    setPendingResolution("");
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-sm border bg-muted/30 p-2 text-sm"
    >
      <span className="font-medium">
        Bulk edit (
        {selectedCount}
        {" "}
        selected)
      </span>
      <div className="flex flex-row flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Slice</span>
          <div className="flex flex-row gap-1">
            <Select
              value={pendingQuadrant}
              onValueChange={setPendingQuadrant}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Pick slice" />
              </SelectTrigger>
              <SelectContent>
                {quadrants.map(q => (
                  <SelectItem
                    key={q.id}
                    value={q.id}
                  >
                    {q.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyQuadrant}
              disabled={!anySelected || !pendingQuadrant}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Ring</span>
          <div className="flex flex-row gap-1">
            <Select
              value={pendingRing}
              onValueChange={setPendingRing}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Pick ring" />
              </SelectTrigger>
              <SelectContent>
                {rings.map(r => (
                  <SelectItem
                    key={r.id}
                    value={r.id}
                  >
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyRing}
              disabled={!anySelected || !pendingRing}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Action</span>
          <div className="flex flex-row gap-1">
            <Select
              value={pendingResolution}
              onValueChange={setPendingResolution}
            >
              <SelectTrigger className="h-8 w-44">
                <SelectValue placeholder="Pick action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">Add Blip</SelectItem>
                <SelectItem value="overwriteAll">Overwrite All</SelectItem>
                <SelectItem value="updateBlip">Update Blip</SelectItem>
                <SelectItem value="removeBlip">Remove Blip</SelectItem>
                <SelectItem value="skip">Skip</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyResolution}
              disabled={!anySelected || !pendingResolution}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearDescriptions}
            disabled={!anySelected}
          >
            Clear descriptions
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearRadarNotes}
            disabled={!anySelected}
          >
            Clear radar notes
          </Button>
        </div>
      </div>
    </div>
  );
}
