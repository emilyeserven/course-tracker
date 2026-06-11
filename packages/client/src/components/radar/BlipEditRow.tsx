import type {
  QuadrantInfo,
  RingInfo,
} from "@/components/radar/blipTableFilters";
import type { RadarBlip } from "@emstack/types";

import { Loader2, XIcon } from "lucide-react";

import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";

export interface EditDraft {
  quadrantId: string;
  ringId: string;
  description: string;
  isIgnored: boolean;
}

interface BlipEditRowProps {
  blip: RadarBlip;
  topicDescription: string | null;
  draft: EditDraft;
  onDraftChange: (draft: EditDraft) => void;
  quadrants: QuadrantInfo[];
  rings: RingInfo[];
  isPending: boolean;
  onCommit: () => void;
  onCancel: () => void;
  colCount: number;
}

export function BlipEditRow({
  blip,
  topicDescription,
  draft,
  onDraftChange,
  quadrants,
  rings,
  isPending,
  onCommit,
  onCancel,
  colCount,
}: BlipEditRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colCount}>
        <div
          className={`
            grid grid-cols-1 gap-4
            md:grid-cols-2
          `}
        >
          <div className="flex flex-col gap-1">
            <span
              className="text-xs text-muted-foreground uppercase"
            >
              Topic
            </span>
            <h3 className="text-lg font-semibold">
              {blip.topicName}
            </h3>
            {topicDescription
              ? (
                <p className="text-sm text-muted-foreground">
                  {topicDescription}
                </p>
              )
              : (
                <p
                  className="text-sm text-muted-foreground italic"
                >
                  (no topic description)
                </p>
              )}
          </div>
          <div className="flex flex-col gap-3">
            <label
              className="flex flex-row items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={draft.isIgnored}
                onChange={e =>
                  onDraftChange({
                    ...draft,
                    isIgnored: e.target.checked,
                  })}
              />
              Ignore (out of scope)
            </label>
            {!draft.isIgnored && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase">
                    Slice
                  </label>
                  <Select
                    value={draft.quadrantId}
                    onValueChange={value =>
                      onDraftChange({
                        ...draft,
                        quadrantId: value,
                      })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose slice" />
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
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase">Ring</label>
                  <Select
                    value={draft.ringId}
                    onValueChange={value =>
                      onDraftChange({
                        ...draft,
                        ringId: value,
                      })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose ring" />
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
                </div>
              </>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase">
                {draft.isIgnored ? "Reason" : "Radar Note"}
              </label>
              <Textarea
                value={draft.description}
                onChange={e =>
                  onDraftChange({
                    ...draft,
                    description: e.target.value,
                  })}
              />
            </div>
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                onClick={onCommit}
                disabled={isPending}
              >
                {isPending && (
                  <Loader2 className="animate-spin" />
                )}
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                <XIcon />
                {" "}
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
