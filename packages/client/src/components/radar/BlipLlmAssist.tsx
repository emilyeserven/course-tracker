import type { PromptMode } from "./blipLlmPrompts";
import type { ResolvedLlmEntry } from "./blipLlmReview";
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

import { CopyIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BulkEditBar } from "./BlipLlmBulkEditBar";
import { buildCleanupPrompt, buildLlmPrompt } from "./blipLlmPrompts";
import { descriptionChanged, parseLlmEntries } from "./blipLlmReview";
import { ReviewTable } from "./BlipLlmReviewTable";

import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { useBlipLlmReview } from "@/hooks/useBlipLlmReview";
import {
  bulkCreateRadarBlips,
  copyTextToClipboard,
  deleteRadarBlip,
  deleteSingleTopic,
  upsertRadarBlip,
  upsertTopic,
} from "@/utils";

interface BlipLlmAssistProps {
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

export function BlipLlmAssist({
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
}: BlipLlmAssistProps) {
  const [mode, setMode] = useState<PromptMode>("setup");

  const prompt = useMemo(
    () => {
      const topicById = new Map(topics.map(t => [t.id, t]));
      const quadrantById = new Map(quadrants.map(q => [q.id, q]));
      const ringById = new Map(rings.map(r => [r.id, r]));
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
      topics,
    ],
  );

  const unassignedCount = useMemo(
    () => existingBlips.filter(b => !b.quadrantId || !b.ringId).length,
    [existingBlips],
  );

  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topicByLowerName = useMemo(() => {
    const map = new Map<string, TopicForTopicsPage>();
    topics.forEach((t) => {
      map.set(t.name.toLowerCase(), t);
    });
    return map;
  }, [topics]);

  const quadrantByLowerName = useMemo(() => {
    const map = new Map<string, RadarQuadrant>();
    quadrants.forEach((q) => {
      map.set(q.name.toLowerCase(), q);
    });
    return map;
  }, [quadrants]);

  const ringByLowerName = useMemo(() => {
    const map = new Map<string, RadarRing>();
    rings.forEach((r) => {
      map.set(r.name.toLowerCase(), r);
    });
    return map;
  }, [rings]);

  const existingBlipByTopicId = useMemo(() => {
    const map = new Map<string, RadarBlip>();
    existingBlips.forEach((b) => {
      map.set(b.topicId, b);
    });
    return map;
  }, [existingBlips]);

  const quadrantById = useMemo(() => {
    const map = new Map<string, RadarQuadrant>();
    quadrants.forEach(q => map.set(q.id, q));
    return map;
  }, [quadrants]);

  const ringById = useMemo(() => {
    const map = new Map<string, RadarRing>();
    rings.forEach(r => map.set(r.id, r));
    return map;
  }, [rings]);

  const topicById = useMemo(() => {
    const map = new Map<string, TopicForTopicsPage>();
    topics.forEach(t => map.set(t.id, t));
    return map;
  }, [topics]);

  const excludedNamesLower = useMemo(() => {
    const set = new Set<string>();
    excludedTopics.forEach((t) => {
      if (t.name) {
        set.add(t.name.toLowerCase());
      }
    });
    return set;
  }, [excludedTopics]);

  const {
    resolved,
    setResolved,
    updateEntry,
    startEdit,
    commitEdit,
    cancelEdit,
    updateDraft,
    setRowSelected,
    setAllSelected,
    bulkSetQuadrant,
    bulkSetRing,
    bulkSetResolution,
    bulkClearDescriptions,
    bulkClearRadarNotes,
    counts,
  } = useBlipLlmReview({
    quadrants,
    rings,
    excludedNamesLower,
  });

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

  return (
    <div className="flex flex-col gap-4 rounded-sm border p-4">
      {!resolved && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Prompt mode</span>
            <div className="flex flex-row flex-wrap gap-4">
              <label className="flex flex-row items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="llm-prompt-mode"
                  value="setup"
                  checked={mode === "setup"}
                  onChange={() => setMode("setup")}
                />
                Setup / Update — propose new and updated blips
              </label>
              <label className="flex flex-row items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="llm-prompt-mode"
                  value="cleanup"
                  checked={mode === "cleanup"}
                  onChange={() => setMode("cleanup")}
                  disabled={unassignedCount === 0}
                />
                Clean up — assign slice/ring to unassigned blips (
                {unassignedCount}
                )
              </label>
            </div>
          </div>
          <div
            className={`
              grid grid-cols-1 gap-4
              md:grid-cols-2
            `}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between">
                <label className="text-sm font-medium">Prompt</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyPrompt}
                >
                  <CopyIcon />
                  {" "}
                  Copy prompt
                </Button>
              </div>
              <pre
                className={`
                  h-96 overflow-auto rounded-sm bg-muted p-3 text-xs
                  whitespace-pre-wrap
                `}
              >
                {prompt}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">JSON response</label>
              <Textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                placeholder='[{ "topic": "...", "action": "add | update | remove", "description": "...", "radarNote": "...", "quadrant": "...", "ring": "..." }]'
                className="h-96 font-mono text-xs"
              />
              {parseError && (
                <p className="text-sm text-destructive">{parseError}</p>
              )}
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={parseAndResolve}
            disabled={!jsonText.trim()}
          >
            Parse and Review
          </Button>
        </>
      )}

      {resolved && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {counts.create}
            {" "}
            to add ·
            {" "}
            {counts.overwriteAll}
            {" "}
            to overwrite ·
            {" "}
            {counts.updateBlip}
            {" "}
            to update ·
            {" "}
            {counts.removeBlip}
            {" "}
            to remove ·
            {" "}
            {counts.skip}
            {" "}
            to skip ·
            {" "}
            {counts.problem}
            {" "}
            problem
            {counts.problem === 1 ? "" : "s"}
            {" "}
            ·
            {" "}
            {counts.newTopic}
            {" "}
            new topic
            {counts.newTopic === 1 ? "" : "s"}
          </p>

          <BulkEditBar
            resolved={resolved}
            quadrants={quadrants}
            rings={rings}
            onBulkQuadrant={bulkSetQuadrant}
            onBulkRing={bulkSetRing}
            onBulkResolution={bulkSetResolution}
            onClearDescriptions={bulkClearDescriptions}
            onClearRadarNotes={bulkClearRadarNotes}
          />

          <ReviewTable
            resolved={resolved}
            quadrants={quadrants}
            rings={rings}
            quadrantById={quadrantById}
            ringById={ringById}
            topicById={topicById}
            updateEntry={updateEntry}
            startEdit={startEdit}
            commitEdit={commitEdit}
            cancelEdit={cancelEdit}
            updateDraft={updateDraft}
            setRowSelected={setRowSelected}
            setAllSelected={setAllSelected}
          />

          <div className="flex flex-row gap-2">
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || actionableCount === 0}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Apply (
              {actionableCount}
              )
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResolved(null)}
              disabled={isSubmitting}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
