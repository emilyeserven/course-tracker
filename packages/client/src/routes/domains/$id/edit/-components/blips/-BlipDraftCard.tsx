import type { BlipDraft } from "./-BlipsPanel";
import type {
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { Loader2, TrashIcon } from "lucide-react";

import { BlipPlacementSelect } from "@/components/radar/BlipPlacementSelect";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BlipDraftCardProps {
  blip: BlipDraft;
  topics: TopicForTopicsPage[];
  usedTopicIds: Set<string>;
  topicById: Map<string, { name: string;
    description?: string | null; }>;
  topicNameById: Map<string, string>;
  persistedQuadrants: RadarQuadrant[];
  persistedRings: RadarRing[];
  pending: boolean;
  onChangeTopic: (topicId: string) => void;
  onChangeQuadrant: (quadrantId: string) => void;
  onChangeRing: (ringId: string) => void;
  onChangeDescription: (description: string) => void;
  onSave: () => void;
  onRemove: () => void;
}

export function BlipDraftCard({
  blip,
  topics,
  usedTopicIds,
  topicById,
  topicNameById,
  persistedQuadrants,
  persistedRings,
  pending,
  onChangeTopic,
  onChangeQuadrant,
  onChangeRing,
  onChangeDescription,
  onSave,
  onRemove,
}: BlipDraftCardProps) {
  const pickedTopic = blip.topicId ? topicById.get(blip.topicId) : null;
  return (
    <li className="flex flex-col gap-3 rounded-sm border p-4">
      <h3 className="text-lg font-semibold">Add Blip</h3>
      <div
        className={`
          grid grid-cols-1 gap-4
          md:grid-cols-2
        `}
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase">Topic</label>
          <Select
            value={blip.topicId}
            onValueChange={onChangeTopic}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose topic" />
            </SelectTrigger>
            <SelectContent>
              {topics
                .filter(t => t.id === blip.topicId || !usedTopicIds.has(t.id))
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
          {pickedTopic
            ? (
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-semibold">{pickedTopic.name}</h4>
                <p
                  className={`
                    text-sm text-muted-foreground
                    ${pickedTopic.description?.trim() ? "" : "italic"}
                  `}
                >
                  {pickedTopic.description?.trim() || "(no topic description)"}
                </p>
              </div>
            )
            : blip.topicId && !topicNameById.has(blip.topicId)
              ? (
                <span className="text-xs text-muted-foreground">
                  (topic not in list)
                </span>
              )
              : null}
        </div>
        <div className="flex flex-col gap-3">
          <BlipPlacementSelect
            label="Slice"
            value={blip.quadrantId}
            placeholder="Choose slice"
            options={persistedQuadrants}
            onValueChange={onChangeQuadrant}
          />
          <BlipPlacementSelect
            label="Ring"
            value={blip.ringId}
            placeholder="Choose ring"
            options={persistedRings}
            onValueChange={onChangeRing}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase">Radar Note</label>
            <Textarea
              value={blip.description}
              onChange={e => onChangeDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Button
          type="button"
          onClick={onSave}
          disabled={pending}
        >
          {pending && <Loader2 className="animate-spin" />}
          Save Blip
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          disabled={pending}
        >
          <TrashIcon />
          {" "}
          Cancel
        </Button>
      </div>
    </li>
  );
}
