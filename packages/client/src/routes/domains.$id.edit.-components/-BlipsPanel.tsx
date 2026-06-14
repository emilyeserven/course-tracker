import type {
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { Loader2, PlusIcon, TrashIcon } from "lucide-react";

import { BlipPlacementSelect } from "@/components/radar/BlipPlacementSelect";
import { BlipTable } from "@/components/radar/BlipTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface BlipDraft {
  id?: string;
  topicId: string;
  description: string;
  quadrantId: string;
  ringId: string;
  localKey: string;
}

interface BlipsTabProps {
  allConfigPersisted: boolean;
  savedBlipsForTable: RadarBlip[];
  newBlipDrafts: BlipDraft[];
  persistedQuadrants: RadarQuadrant[];
  persistedRings: RadarRing[];
  topics: TopicForTopicsPage[];
  usedTopicIds: Set<string>;
  pendingBlipKey: string | null;
  topicById: Map<string, { name: string;
    description?: string | null; }>;
  topicNameById: Map<string, string>;
  onAddBlip: () => void;
  onChangeBlipTopic: (localKey: string, topicId: string) => void;
  onChangeBlipQuadrant: (localKey: string, quadrantId: string) => void;
  onChangeBlipRing: (localKey: string, ringId: string) => void;
  onChangeBlipDescription: (localKey: string, description: string) => void;
  onSaveBlip: (blip: BlipDraft) => void;
  onRemoveBlip: (blip: BlipDraft) => void;
  onTableSave: (
    blip: RadarBlip,
    patch: {
      quadrantId: string | null;
      ringId: string | null;
      description: string | null;
      isIgnored: boolean;
    },
  ) => Promise<void>;
  onTableRemove: (blip: RadarBlip) => Promise<void>;
  onTableBulkSave: (
    ids: string[],
    patch: { quadrantId?: string;
      ringId?: string; },
  ) => Promise<void>;
}

export function BlipsPanel({
  allConfigPersisted,
  savedBlipsForTable,
  newBlipDrafts,
  persistedQuadrants,
  persistedRings,
  topics,
  usedTopicIds,
  pendingBlipKey,
  topicById,
  topicNameById,
  onAddBlip,
  onChangeBlipTopic,
  onChangeBlipQuadrant,
  onChangeBlipRing,
  onChangeBlipDescription,
  onSaveBlip,
  onRemoveBlip,
  onTableSave,
  onTableRemove,
  onTableBulkSave,
}: BlipsTabProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-end gap-2">
        <Button
          type="button"
          onClick={onAddBlip}
          disabled={!allConfigPersisted}
        >
          <PlusIcon />
          {" "}
          Add Blip
        </Button>
      </div>
      {!allConfigPersisted && (
        <p className="text-sm text-amber-700">
          Save your slices and rings before adding blips.
        </p>
      )}

      {allConfigPersisted && (
        <BlipTable
          blips={savedBlipsForTable}
          quadrants={persistedQuadrants}
          rings={persistedRings}
          topics={topics}
          onSave={onTableSave}
          onRemove={onTableRemove}
          onBulkSave={onTableBulkSave}
        />
      )}

      {newBlipDrafts.length > 0 && (
        <ul className="flex flex-col gap-4">
          {newBlipDrafts.map((blip) => {
            const pickedTopic = blip.topicId
              ? topicById.get(blip.topicId)
              : null;
            return (
              <li
                key={blip.localKey}
                className="flex flex-col gap-3 rounded-sm border p-4"
              >
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
                      onValueChange={value =>
                        onChangeBlipTopic(blip.localKey, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics
                          .filter(
                            t =>
                              t.id === blip.topicId || !usedTopicIds.has(t.id),
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
                    {pickedTopic
                      ? (
                        <div className="flex flex-col gap-1">
                          <h4 className="text-base font-semibold">
                            {pickedTopic.name}
                          </h4>
                          <p
                            className={`
                              text-sm text-muted-foreground
                              ${pickedTopic.description?.trim() ? "" : "italic"}
                            `}
                          >
                            {pickedTopic.description?.trim()
                              || "(no topic description)"}
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
                      onValueChange={value =>
                        onChangeBlipQuadrant(blip.localKey, value)}
                    />
                    <BlipPlacementSelect
                      label="Ring"
                      value={blip.ringId}
                      placeholder="Choose ring"
                      options={persistedRings}
                      onValueChange={value =>
                        onChangeBlipRing(blip.localKey, value)}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs uppercase">Radar Note</label>
                      <Textarea
                        value={blip.description}
                        onChange={e =>
                          onChangeBlipDescription(blip.localKey, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    type="button"
                    onClick={() => onSaveBlip(blip)}
                    disabled={pendingBlipKey === blip.localKey}
                  >
                    {pendingBlipKey === blip.localKey && (
                      <Loader2 className="animate-spin" />
                    )}
                    Save Blip
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onRemoveBlip(blip)}
                    disabled={pendingBlipKey === blip.localKey}
                  >
                    <TrashIcon />
                    {" "}
                    Cancel
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
