import type { RadarQuadrant, RadarRing } from "@emstack/types";

import { Loader2 } from "lucide-react";

import { NO_CHANGE } from "@/components/radar/blipTableFilters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlipBulkBarProps {
  selectedCount: number;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  bulkQuadrantId: string;
  bulkRingId: string;
  onBulkQuadrantChange: (value: string) => void;
  onBulkRingChange: (value: string) => void;
  bulkPending: boolean;
  onApply: () => void;
  onClear: () => void;
}

export function BlipBulkBar({
  selectedCount,
  quadrants,
  rings,
  bulkQuadrantId,
  bulkRingId,
  onBulkQuadrantChange,
  onBulkRingChange,
  bulkPending,
  onApply,
  onClear,
}: BlipBulkBarProps) {
  return (
    <div
      className={`
        flex flex-row flex-wrap items-center gap-2 rounded-sm border
        border-primary/40 bg-primary/5 p-2
      `}
    >
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Select
        value={bulkQuadrantId}
        onValueChange={onBulkQuadrantChange}
      >
        <SelectTrigger className="min-w-40">
          <SelectValue placeholder="Slice" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CHANGE}>(don&apos;t change slice)</SelectItem>
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
      <Select
        value={bulkRingId}
        onValueChange={onBulkRingChange}
      >
        <SelectTrigger className="min-w-32">
          <SelectValue placeholder="Ring" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CHANGE}>(don&apos;t change ring)</SelectItem>
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
        size="sm"
        onClick={onApply}
        disabled={
          bulkPending
          || (bulkQuadrantId === NO_CHANGE && bulkRingId === NO_CHANGE)
        }
      >
        {bulkPending && <Loader2 className="animate-spin" />}
        Apply to {selectedCount}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onClear}
        disabled={bulkPending}
      >
        Clear
      </Button>
    </div>
  );
}
