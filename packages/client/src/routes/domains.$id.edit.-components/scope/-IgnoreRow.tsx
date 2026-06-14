import type { TopicForTopicsPage } from "@emstack/types";

import { TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// An "ignore" row maps to a radar blip with `isIgnored = true`. `blipId` is
// absent for rows the user just added (created on save).
export interface IgnoreRowValue {
  blipId?: string;
  topicId: string;
  reason: string;
  localKey: string;
}

interface IgnoreRowProps {
  row: IgnoreRowValue;
  topics: TopicForTopicsPage[];
  usedIgnoreTopicIds: Set<string>;
  withinTopicIds: string[];
  onRadarTopicIds: Set<string>;
  onChange: (patch: Partial<IgnoreRowValue>) => void;
  onRemove: () => void;
}

export function IgnoreRow({
  row,
  topics,
  usedIgnoreTopicIds,
  withinTopicIds,
  onRadarTopicIds,
  onChange,
  onRemove,
}: IgnoreRowProps) {
  return (
    <li className="flex flex-col gap-2 rounded-sm border p-3">
      <div
        className={`
          grid grid-cols-1 gap-2
          sm:grid-cols-[minmax(0,1fr)_auto]
        `}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground uppercase">
            Topic
          </label>
          <Select
            value={row.topicId}
            onValueChange={value =>
              onChange({
                topicId: value,
              })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose topic" />
            </SelectTrigger>
            <SelectContent>
              {topics
                .filter(
                  t =>
                    t.id === row.topicId
                    || (!usedIgnoreTopicIds.has(t.id)
                      && !withinTopicIds.includes(t.id)
                      && !onRadarTopicIds.has(t.id)),
                )
                .map(t => (
                  <SelectItem
                    key={t.id}
                    value={t.id}
                  >
                    {t.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label="Remove ignored topic"
          >
            <TrashIcon />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground uppercase">
          Reason (optional)
        </label>
        <Textarea
          value={row.reason}
          onChange={e =>
            onChange({
              reason: e.target.value,
            })}
          placeholder="Why should the radar ignore this topic?"
        />
      </div>
    </li>
  );
}
