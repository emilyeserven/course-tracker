import type {
  Radar,
  RadarBlip,
  TopicForTopicsPage,
} from "@emstack/types/src";

import { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { BlipsTab as BlipsPanel } from "@/components/radar/BlipsTab";
import {
  createRadarBlip,
  deleteRadarBlip,
  upsertRadarBlip,
} from "@/utils";

interface BlipsTabContainerProps {
  radar: Radar | undefined;
  topics: TopicForTopicsPage[];
  domainId: string;
  onSaved: () => Promise<void>;
}

interface BlipDraft {
  id?: string;
  topicId: string;
  description: string;
  quadrantId: string;
  ringId: string;
  localKey: string;
}

let localKeyCounter = 0;
function nextLocalKey() {
  localKeyCounter += 1;
  return `local-${localKeyCounter}`;
}

export function BlipsTabContainer({
  radar,
  topics,
  domainId,
  onSaved,
}: BlipsTabContainerProps) {
  const [newBlipDrafts, setNewBlipDrafts] = useState<BlipDraft[]>([]);
  const [pendingBlipKey, setPendingBlipKey] = useState<string | null>(null);

  // When the radar changes (e.g., after a save), drop drafts that have been
  // persisted (their localKey will appear in the new server data via id).
  useEffect(() => {
    setNewBlipDrafts(prev =>
      prev.filter(d => !d.id || !radar?.blips.some(b => b.id === d.id)));
  }, [radar]);

  const persistedQuadrants = useMemo(
    () => (radar?.quadrants ?? []).map(q => ({
      id: q.id,
      name: q.name,
      position: q.position,
    })),
    [radar],
  );
  const persistedRings = useMemo(
    () => (radar?.rings ?? []).map(r => ({
      id: r.id,
      name: r.name,
      position: r.position,
    })),
    [radar],
  );
  const allConfigPersisted
    = persistedQuadrants.length > 0 && persistedRings.length > 0;

  const savedBlipsForTable = useMemo(() => radar?.blips ?? [], [radar]);

  const usedTopicIds = useMemo(() => {
    const set = new Set<string>();
    savedBlipsForTable.forEach((b) => {
      if (b.topicId) set.add(b.topicId);
    });
    newBlipDrafts.forEach((b) => {
      if (b.topicId) set.add(b.topicId);
    });
    return set;
  }, [savedBlipsForTable, newBlipDrafts]);

  const topicNameById = useMemo(() => {
    const map = new Map<string, string>();
    topics.forEach(t => map.set(t.id, t.name));
    return map;
  }, [topics]);

  const topicById = useMemo(() => {
    const map = new Map<string, { name: string;
      description?: string | null; }>();
    topics.forEach(t =>
      map.set(t.id, {
        name: t.name,
        description: t.description,
      }));
    return map;
  }, [topics]);

  function addBlipDraft() {
    if (persistedQuadrants.length === 0 || persistedRings.length === 0) {
      toast.error("Add at least one slice and ring first.");
      return;
    }
    setNewBlipDrafts(prev => [
      ...prev,
      {
        topicId: "",
        description: "",
        quadrantId: persistedQuadrants[0].id,
        ringId: persistedRings[0].id,
        localKey: nextLocalKey(),
      },
    ]);
  }

  function changeBlipTopic(localKey: string, topicId: string) {
    setNewBlipDrafts(prev =>
      prev.map(b =>
        b.localKey === localKey
          ? {
            ...b,
            topicId,
          }
          : b));
  }
  function changeBlipQuadrant(localKey: string, quadrantId: string) {
    setNewBlipDrafts(prev =>
      prev.map(b =>
        b.localKey === localKey
          ? {
            ...b,
            quadrantId,
          }
          : b));
  }
  function changeBlipRing(localKey: string, ringId: string) {
    setNewBlipDrafts(prev =>
      prev.map(b =>
        b.localKey === localKey
          ? {
            ...b,
            ringId,
          }
          : b));
  }
  function changeBlipDescription(localKey: string, description: string) {
    setNewBlipDrafts(prev =>
      prev.map(b =>
        b.localKey === localKey
          ? {
            ...b,
            description,
          }
          : b));
  }

  async function saveBlip(blip: BlipDraft) {
    if (!blip.topicId) {
      toast.error("Pick a topic for this blip.");
      return;
    }
    if (!blip.quadrantId || !blip.ringId) {
      toast.error("Pick a slice and ring.");
      return;
    }
    setPendingBlipKey(blip.localKey);
    try {
      const payload = {
        topicId: blip.topicId,
        description: blip.description.trim() || null,
        quadrantId: blip.quadrantId,
        ringId: blip.ringId,
      };
      if (blip.id) {
        await upsertRadarBlip(domainId, blip.id, payload);
      }
      else {
        await createRadarBlip(domainId, payload);
      }
      setNewBlipDrafts(prev => prev.filter(b => b.localKey !== blip.localKey));
      await onSaved();
      toast.success("Blip saved.");
    }
    catch {
      toast.error("Failed to save blip.");
    }
    finally {
      setPendingBlipKey(null);
    }
  }

  async function removeBlip(blip: BlipDraft) {
    if (blip.id) {
      setPendingBlipKey(blip.localKey);
      try {
        await deleteRadarBlip(domainId, blip.id);
        await onSaved();
      }
      catch {
        toast.error("Failed to delete blip.");
        setPendingBlipKey(null);
        return;
      }
      setPendingBlipKey(null);
    }
    setNewBlipDrafts(prev => prev.filter(b => b.localKey !== blip.localKey));
  }

  async function handleTableSave(
    blip: RadarBlip,
    patch: { quadrantId: string;
      ringId: string;
      description: string | null; },
  ) {
    try {
      await upsertRadarBlip(domainId, blip.id, {
        topicId: blip.topicId,
        quadrantId: patch.quadrantId,
        ringId: patch.ringId,
        description: patch.description,
      });
      await onSaved();
      toast.success("Blip saved.");
    }
    catch {
      toast.error("Failed to save blip.");
      throw new Error("save failed");
    }
  }

  async function handleTableRemove(blip: RadarBlip) {
    try {
      await deleteRadarBlip(domainId, blip.id);
      await onSaved();
    }
    catch {
      toast.error("Failed to delete blip.");
      throw new Error("delete failed");
    }
  }

  return (
    <BlipsPanel
      allConfigPersisted={allConfigPersisted}
      savedBlipsForTable={savedBlipsForTable}
      newBlipDrafts={newBlipDrafts}
      persistedQuadrants={persistedQuadrants}
      persistedRings={persistedRings}
      topics={topics}
      usedTopicIds={usedTopicIds}
      pendingBlipKey={pendingBlipKey}
      topicById={topicById}
      topicNameById={topicNameById}
      onAddBlip={addBlipDraft}
      onChangeBlipTopic={changeBlipTopic}
      onChangeBlipQuadrant={changeBlipQuadrant}
      onChangeBlipRing={changeBlipRing}
      onChangeBlipDescription={changeBlipDescription}
      onSaveBlip={saveBlip}
      onRemoveBlip={removeBlip}
      onTableSave={handleTableSave}
      onTableRemove={handleTableRemove}
    />
  );
}
