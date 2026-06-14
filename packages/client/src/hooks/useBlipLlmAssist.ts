import type { PromptMode } from "@/components/radar/blipLlmPrompts";
import type { ResolvedLlmEntry } from "@/components/radar/blipLlmReview";
import type { BulkBlipEntry } from "@/utils";
import type {
  DomainExcludedTopic,
  DomainTopic,
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { buildCleanupPrompt, buildLlmPrompt } from "@/components/radar/blipLlmPrompts";
import { descriptionChanged, parseLlmEntries } from "@/components/radar/blipLlmReview";
import { useBlipLlmReview } from "@/hooks/useBlipLlmReview";
import { useIndexById, useIndexByLowerName } from "@/hooks/useIndexBy";
import {
  bulkCreateRadarBlips,
  copyTextToClipboard,
  deleteRadarBlip,
  deleteSingleTopic,
  upsertRadarBlip,
  upsertTopic,
} from "@/utils";

export interface UseBlipLlmAssistArgs {
  domainId: string;
  domainTitle: string;
  domainDescription?: string | null;
  domainTopics?: DomainTopic[];
  excludedTopics?: DomainExcludedTopic[];
  withinScopeDescription?: string | null;
  outOfScopeDescription?: string | null;
  withinScopeTopicNames?: string[];
  outOfScopeTopicNames?: string[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  topics: TopicForTopicsPage[];
  existingBlips: RadarBlip[];
  onComplete: () => void;
}

export function useBlipLlmAssist({
  domainId,
  domainTitle,
  domainDescription = null,
  domainTopics = [],
  excludedTopics = [],
  withinScopeDescription = null,
  outOfScopeDescription = null,
  withinScopeTopicNames = [],
  outOfScopeTopicNames = [],
  quadrants,
  rings,
  topics,
  existingBlips,
  onComplete,
}: UseBlipLlmAssistArgs) {
  const [mode, setMode] = useState<PromptMode>("setup");

  const quadrantById = useIndexById(quadrants);
  const ringById = useIndexById(rings);
  const topicById = useIndexById(topics);

  const prompt = useMemo(
    () => {
      if (mode === "cleanup") {
        const unassignedBlips = existingBlips
          .filter(b => !b.quadrantId || !b.ringId)
          .map(b => ({
            topicName: b.topicName,
            quadrantName: b.quadrantId
              ? quadrantById.get(b.quadrantId)?.name ?? null
              : null,
            ringName: b.ringId ? ringById.get(b.ringId)?.name ?? null : null,
            radarNote: b.description,
            topicDescription: topicById.get(b.topicId)?.description ?? null,
          }));
        return buildCleanupPrompt({
          domainTitle,
          domainDescription,
          withinScopeDescription,
          outOfScopeDescription,
          quadrants,
          rings,
          unassignedBlips,
        });
      }
      return buildLlmPrompt({
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
        existingBlips: existingBlips.map((b) => {
          const ring = b.ringId ? ringById.get(b.ringId) : null;
          const quadrant = b.quadrantId ? quadrantById.get(b.quadrantId) : null;
          return {
            topicName: b.topicName,
            radarNote: b.description,
            topicDescription: topicById.get(b.topicId)?.description ?? null,
            currentSliceName: quadrant?.name ?? null,
            currentRingName: ring?.name ?? null,
          };
        }),
      });
    },
    [
      mode,
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
      existingBlips,
      quadrantById,
      ringById,
      topicById,
    ],
  );

  const unassignedCount = useMemo(
    () => existingBlips.filter(b => !b.quadrantId || !b.ringId).length,
    [existingBlips],
  );

  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topicByLowerName = useIndexByLowerName(topics);
  const quadrantByLowerName = useIndexByLowerName(quadrants);
  const ringByLowerName = useIndexByLowerName(rings);

  const existingBlipByTopicId = useMemo(() => {
    const map = new Map<string, RadarBlip>();
    existingBlips.forEach((b) => {
      map.set(b.topicId, b);
    });
    return map;
  }, [existingBlips]);

  const excludedNamesLower = useMemo(() => {
    const set = new Set<string>();
    excludedTopics.forEach((t) => {
      if (t.name) {
        set.add(t.name.toLowerCase());
      }
    });
    return set;
  }, [excludedTopics]);

  const review = useBlipLlmReview({
    quadrants,
    rings,
    excludedNamesLower,
  });
  const {
    resolved, setResolved, counts,
  } = review;

  async function copyPrompt() {
    const ok = await copyTextToClipboard(prompt);
    if (ok) {
      toast.success("Prompt copied to clipboard.");
    }
    else {
      toast.error("Couldn't copy — please select and copy manually.");
    }
  }

  function parseAndResolve() {
    setParseError(null);
    const result = parseLlmEntries(jsonText, {
      topicByLowerName,
      quadrantByLowerName,
      ringByLowerName,
      existingBlipByTopicId,
      excludedNamesLower,
    });
    if (result.error !== null) {
      setParseError(result.error);
      setResolved(null);
      return;
    }
    setResolved(result.entries);
  }

  function isActionable(r: ResolvedLlmEntry): boolean {
    if (r.resolution === "skip") {
      return false;
    }
    return r.problems.length === 0;
  }

  async function handleConfirm() {
    if (!resolved) {
      return;
    }
    const actionable = resolved.filter(isActionable);
    if (actionable.length === 0) {
      toast.error("No actionable entries.");
      return;
    }
    setIsSubmitting(true);
    try {
      const toCreate = actionable.filter(r => r.resolution === "create");
      const toOverwriteAll = actionable.filter(
        r => r.resolution === "overwriteAll" && r.existingBlipId,
      );
      const toUpdateBlip = actionable.filter(
        r => r.resolution === "updateBlip" && r.existingBlipId,
      );
      const toRemove = actionable.filter(
        r => r.resolution === "removeBlip" && r.existingBlipId,
      );

      let createCount = 0;
      if (toCreate.length > 0) {
        const blips: BulkBlipEntry[] = toCreate.map(r => ({
          topicId: r.matchedTopicId,
          newTopicName: r.matchedTopicId ? null : r.topicName,
          newTopicDescription: r.matchedTopicId ? null : r.description,
          quadrantId: r.quadrantId as string,
          ringId: r.ringId as string,
          description: r.radarNote,
        }));
        const result = await bulkCreateRadarBlips(domainId, {
          blips,
        });
        createCount = result.count;
      }

      let overwriteCount = 0;
      for (const r of toOverwriteAll) {
        await upsertRadarBlip(domainId, r.existingBlipId as string, {
          topicId: r.matchedTopicId as string,
          quadrantId: r.quadrantId as string,
          ringId: r.ringId as string,
          description: r.radarNote,
        });
        if (r.matchedTopicId && descriptionChanged(r)) {
          await upsertTopic(r.matchedTopicId, {
            name: r.topicName,
            description: r.description,
          });
        }
        overwriteCount += 1;
      }

      let updateCount = 0;
      for (const r of toUpdateBlip) {
        await upsertRadarBlip(domainId, r.existingBlipId as string, {
          topicId: r.matchedTopicId as string,
          quadrantId: (r.quadrantId ?? r.existingQuadrantId) as string,
          ringId: (r.ringId ?? r.existingRingId) as string,
          description: r.radarNote,
        });
        updateCount += 1;
      }

      let removeBlipCount = 0;
      let removeTopicCount = 0;
      for (const r of toRemove) {
        await deleteRadarBlip(domainId, r.existingBlipId as string);
        removeBlipCount += 1;
        if (r.deleteTopicOnRemove && r.matchedTopicId) {
          await deleteSingleTopic(r.matchedTopicId);
          removeTopicCount += 1;
        }
      }

      const parts: string[] = [];
      if (createCount > 0) {
        parts.push(`added ${createCount}`);
      }
      if (overwriteCount > 0) {
        parts.push(`overwrote ${overwriteCount}`);
      }
      if (updateCount > 0) {
        parts.push(`updated ${updateCount}`);
      }
      if (removeBlipCount > 0) {
        parts.push(`removed ${removeBlipCount}`);
      }
      if (removeTopicCount > 0) {
        parts.push(`deleted ${removeTopicCount} topic${removeTopicCount === 1 ? "" : "s"}`);
      }
      toast.success(`Done — ${parts.join(", ")}.`);
      setJsonText("");
      setResolved(null);
      onComplete();
    }
    catch {
      toast.error("Failed to apply changes.");
    }
    finally {
      setIsSubmitting(false);
    }
  }

  const actionableCount
    = counts.create + counts.overwriteAll + counts.updateBlip + counts.removeBlip;

  return {
    ...review,
    mode,
    setMode,
    prompt,
    unassignedCount,
    jsonText,
    setJsonText,
    parseError,
    isSubmitting,
    quadrantById,
    ringById,
    topicById,
    actionableCount,
    copyPrompt,
    parseAndResolve,
    handleConfirm,
  };
}
