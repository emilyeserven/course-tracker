import type {
  Domain,
  Radar,
  TopicForTopicsPage,
} from "@emstack/types/src";

import { useMemo } from "react";

import { LlmEditTab } from "@/components/radar/LlmEditTab";

interface LlmTabContainerProps {
  radar: Radar | undefined;
  domain: Domain;
  topics: TopicForTopicsPage[];
  onComplete: () => Promise<void>;
}

export function LlmTabContainer({
  radar,
  domain,
  topics,
  onComplete,
}: LlmTabContainerProps) {
  const allConfigPersisted
    = (radar?.quadrants.length ?? 0) > 0 && (radar?.rings.length ?? 0) > 0;

  const topicNameById = useMemo(() => {
    const map = new Map<string, string>();
    topics.forEach(t => map.set(t.id, t.name));
    return map;
  }, [topics]);

  const withinScopeNames = (domain.withinScopeTopics ?? [])
    .map(t => topicNameById.get(t.id))
    .filter((n): n is string => Boolean(n));

  const outOfScopeNames = (domain.excludedTopics ?? [])
    .map(t => topicNameById.get(t.id))
    .filter((n): n is string => Boolean(n));

  return (
    <LlmEditTab
      allConfigPersisted={allConfigPersisted}
      domainId={domain.id}
      domainTitle={domain.title}
      domainDescription={domain.description ?? null}
      domainTopics={domain.topics ?? []}
      excludedTopics={domain.excludedTopics ?? []}
      withinScopeDescription={domain.withinScopeDescription ?? ""}
      outOfScopeDescription={domain.outOfScopeDescription ?? ""}
      withinScopeTopicNames={withinScopeNames}
      outOfScopeTopicNames={outOfScopeNames}
      quadrants={radar?.quadrants ?? []}
      rings={radar?.rings ?? []}
      topics={topics}
      existingBlips={radar?.blips ?? []}
      onComplete={() => {
        void onComplete();
      }}
    />
  );
}
