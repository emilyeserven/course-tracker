import type {
  DomainExcludedTopic,
  DomainTopic,
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types/src";

import { BlipLlmAssist } from "@/components/radar/BlipLlmAssist";

interface LlmEditTabProps {
  allConfigPersisted: boolean;
  domainId: string;
  domainTitle: string;
  domainDescription: string | null;
  domainTopics: DomainTopic[];
  excludedTopics: DomainExcludedTopic[];
  withinScopeDescription: string;
  outOfScopeDescription: string;
  withinScopeTopicNames: string[];
  outOfScopeTopicNames: string[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  topics: TopicForTopicsPage[];
  existingBlips: RadarBlip[];
  onComplete: () => void;
}

export function LlmEditTab({
  allConfigPersisted,
  domainId,
  domainTitle,
  domainDescription,
  domainTopics,
  excludedTopics,
  withinScopeDescription,
  outOfScopeDescription,
  withinScopeTopicNames,
  outOfScopeTopicNames,
  quadrants,
  rings,
  topics,
  existingBlips,
  onComplete,
}: LlmEditTabProps) {
  if (!allConfigPersisted) {
    return (
      <p className="text-sm text-amber-700">
        Save your slices and rings before using LLM-assisted edits.
      </p>
    );
  }
  return (
    <BlipLlmAssist
      domainId={domainId}
      domainTitle={domainTitle}
      domainDescription={domainDescription}
      domainTopics={domainTopics}
      excludedTopics={excludedTopics}
      withinScopeDescription={withinScopeDescription}
      outOfScopeDescription={outOfScopeDescription}
      withinScopeTopicNames={withinScopeTopicNames}
      outOfScopeTopicNames={outOfScopeTopicNames}
      quadrants={quadrants}
      rings={rings}
      topics={topics}
      existingBlips={existingBlips}
      onComplete={onComplete}
    />
  );
}
