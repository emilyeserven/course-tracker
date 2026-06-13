import type { RadarQuadrant, RadarRing } from "@emstack/types";

import { Input } from "@/components/input";
import {
  ALL,
  UNASSIGNED,
} from "@/components/radar/blipTableFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FieldCounts {
  unassigned: number;
  counts: Map<string, number>;
}

interface BlipTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterQuadrant: string;
  onFilterQuadrantChange: (value: string) => void;
  filterRing: string;
  onFilterRingChange: (value: string) => void;
  showItemsColumn: boolean;
  onShowItemsColumnChange: (value: boolean) => void;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  blipCount: number;
  sliceCounts: FieldCounts;
  ringCounts: FieldCounts;
}

export function BlipTableToolbar({
  search,
  onSearchChange,
  filterQuadrant,
  onFilterQuadrantChange,
  filterRing,
  onFilterRingChange,
  showItemsColumn,
  onShowItemsColumnChange,
  quadrants,
  rings,
  blipCount,
  sliceCounts,
  ringCounts,
}: BlipTableToolbarProps) {
  return (
    <div
      className={`
        grid grid-cols-1 gap-2
        sm:grid-cols-[1fr_auto_auto_auto]
      `}
    >
      <Input
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search topic or note"
      />
      <Select
        value={filterQuadrant}
        onValueChange={onFilterQuadrantChange}
      >
        <SelectTrigger className="min-w-40">
          <SelectValue placeholder="Slice" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Slices ({blipCount})</SelectItem>
          <SelectItem value={UNASSIGNED}>
            Unassigned ({sliceCounts.unassigned})
          </SelectItem>
          {quadrants.map(q => (
            <SelectItem
              key={q.id}
              value={q.id}
            >
              {q.name}
              {" ("}
              {sliceCounts.counts.get(q.id) ?? 0})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filterRing}
        onValueChange={onFilterRingChange}
      >
        <SelectTrigger className="min-w-32">
          <SelectValue placeholder="Ring" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Rings ({blipCount})</SelectItem>
          <SelectItem value={UNASSIGNED}>
            Unassigned ({ringCounts.unassigned})
          </SelectItem>
          {rings.map(r => (
            <SelectItem
              key={r.id}
              value={r.id}
            >
              {r.name}
              {" ("}
              {ringCounts.counts.get(r.id) ?? 0})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="flex flex-row items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showItemsColumn}
          onChange={e => onShowItemsColumnChange(e.target.checked)}
        />
        Topic Items
      </label>
    </div>
  );
}
