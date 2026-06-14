import type { Radar, TopicForTopicsPage } from "@emstack/types";

import { BlipsPanel } from "./-BlipsPanel";
import { useBlipDrafts } from "./-useBlipDrafts";

interface BlipsTabContainerProps {
  radar: Radar | undefined;
  topics: TopicForTopicsPage[];
  domainId: string;
  onSaved: () => Promise<void>;
}

export function BlipsTabContainer({
  radar,
  topics,
  domainId,
  onSaved,
}: BlipsTabContainerProps) {
  const blips = useBlipDrafts({
    radar,
    topics,
    domainId,
    onSaved,
  });

  return (
    <BlipsPanel
      allConfigPersisted={blips.allConfigPersisted}
      savedBlipsForTable={blips.savedBlipsForTable}
      newBlipDrafts={blips.newBlipDrafts}
      persistedQuadrants={blips.persistedQuadrants}
      persistedRings={blips.persistedRings}
      topics={topics}
      usedTopicIds={blips.usedTopicIds}
      pendingBlipKey={blips.pendingBlipKey}
      topicById={blips.topicById}
      topicNameById={blips.topicNameById}
      onAddBlip={blips.addBlipDraft}
      onChangeBlipTopic={blips.changeBlipTopic}
      onChangeBlipQuadrant={blips.changeBlipQuadrant}
      onChangeBlipRing={blips.changeBlipRing}
      onChangeBlipDescription={blips.changeBlipDescription}
      onSaveBlip={blips.saveBlip}
      onRemoveBlip={blips.removeBlip}
      onTableSave={blips.handleTableSave}
      onTableRemove={blips.handleTableRemove}
      onTableBulkSave={blips.handleTableBulkSave}
    />
  );
}
