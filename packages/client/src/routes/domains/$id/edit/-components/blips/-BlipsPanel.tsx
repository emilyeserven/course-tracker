import type {
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { PlusIcon } from "lucide-react";

import { BlipDraftCard } from "./-BlipDraftCard";

import { BlipTable } from "@/components/radar/BlipTable";
import { Button } from "@/components/ui/button";

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
          {newBlipDrafts.map(blip => (
            <BlipDraftCard
              key={blip.localKey}
              blip={blip}
              topics={topics}
              usedTopicIds={usedTopicIds}
              topicById={topicById}
              topicNameById={topicNameById}
              persistedQuadrants={persistedQuadrants}
              persistedRings={persistedRings}
              pending={pendingBlipKey === blip.localKey}
              onChangeTopic={value => onChangeBlipTopic(blip.localKey, value)}
              onChangeQuadrant={value =>
                onChangeBlipQuadrant(blip.localKey, value)}
              onChangeRing={value => onChangeBlipRing(blip.localKey, value)}
              onChangeDescription={value =>
                onChangeBlipDescription(blip.localKey, value)}
              onSave={() => onSaveBlip(blip)}
              onRemove={() => onRemoveBlip(blip)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
