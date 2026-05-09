import type { Domain, TopicForTopicsPage } from "@emstack/types/src";

import { useEffect, useMemo, useRef, useState } from "react";

import { Loader2, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { TopicMultiSelect } from "@/components/radar/TopicMultiSelect";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertDomain } from "@/utils";

interface ScopeTabProps {
  domain: Domain;
  topics: TopicForTopicsPage[];
  onSaved: () => Promise<void>;
  onChangeStateChange?: (hasChanges: boolean) => void;
}

interface ExcludedRow {
  topicId: string;
  reason: string;
  localKey: string;
}

let exclusionKeyCounter = 0;
function nextExclusionKey() {
  exclusionKeyCounter += 1;
  return `exclusion-${exclusionKeyCounter}`;
}

function buildExcludedFromDomain(domain: Domain): ExcludedRow[] {
  return (domain.excludedTopics ?? []).map(et => ({
    topicId: et.id,
    reason: et.reason ?? "",
    localKey: nextExclusionKey(),
  }));
}

export function ScopeTab({
  domain,
  topics,
  onSaved,
  onChangeStateChange,
}: ScopeTabProps) {
  const startingWithinDescription = domain.withinScopeDescription ?? "";
  const startingOutDescription = domain.outOfScopeDescription ?? "";
  const startingWithinTopicIds = useMemo(
    () => (domain.withinScopeTopics ?? []).map(t => t.id),
    [domain],
  );
  const startingExcluded = useMemo(
    () => buildExcludedFromDomain(domain),
    [domain],
  );

  const [withinDescription, setWithinDescription] = useState(startingWithinDescription);
  const [outDescription, setOutDescription] = useState(startingOutDescription);
  const [withinTopicIds, setWithinTopicIds] = useState<string[]>(startingWithinTopicIds);
  const [excludedRows, setExcludedRows] = useState<ExcludedRow[]>(startingExcluded);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedRef = useRef({
    withinDescription: startingWithinDescription,
    outDescription: startingOutDescription,
    withinTopicIds: startingWithinTopicIds,
    excludedRows: startingExcluded,
  });

  const usedExclusionTopicIds = useMemo(
    () => new Set(excludedRows.map(r => r.topicId).filter(Boolean)),
    [excludedRows],
  );

  const hasChanges = useMemo(() => {
    const last = lastSavedRef.current;
    if (withinDescription !== last.withinDescription) return true;
    if (outDescription !== last.outDescription) return true;
    if (withinTopicIds.length !== last.withinTopicIds.length
      || withinTopicIds.some((v, i) => v !== last.withinTopicIds[i])) {
      return true;
    }
    if (excludedRows.length !== last.excludedRows.length) return true;
    const lastByTopic = new Map(last.excludedRows.map(r => [r.topicId, r.reason]));
    return excludedRows.some(r => !lastByTopic.has(r.topicId) || lastByTopic.get(r.topicId) !== r.reason);
  }, [withinDescription, outDescription, withinTopicIds, excludedRows]);

  useEffect(() => {
    onChangeStateChange?.(hasChanges);
  }, [hasChanges, onChangeStateChange]);

  function addExclusion() {
    setExcludedRows(prev => [
      ...prev,
      {
        topicId: "",
        reason: "",
        localKey: nextExclusionKey(),
      },
    ]);
  }

  function removeExclusion(localKey: string) {
    setExcludedRows(prev => prev.filter(r => r.localKey !== localKey));
  }

  function updateExclusion(localKey: string, patch: Partial<ExcludedRow>) {
    setExcludedRows(prev =>
      prev.map(r =>
        r.localKey === localKey
          ? {
            ...r,
            ...patch,
          }
          : r));
  }

  async function handleSave() {
    const cleanedExcluded = excludedRows
      .filter(r => r.topicId)
      .map(r => ({
        topicId: r.topicId,
        reason: r.reason.trim() || null,
      }));
    const seen = new Set<string>();
    const dedupedExcluded = cleanedExcluded.filter((r) => {
      if (seen.has(r.topicId)) return false;
      seen.add(r.topicId);
      return true;
    });

    setIsSaving(true);
    try {
      await upsertDomain(domain.id, {
        title: domain.title,
        description: domain.description ?? null,
        withinScopeDescription: withinDescription.trim() || null,
        outOfScopeDescription: outDescription.trim() || null,
        withinScopeTopicIds: withinTopicIds,
        excludedTopics: dedupedExcluded,
      });
      lastSavedRef.current = {
        withinDescription,
        outDescription,
        withinTopicIds,
        excludedRows: excludedRows.slice(),
      };
      onChangeStateChange?.(false);
      await onSaved();
      toast.success("Scope saved.");
    }
    catch {
      toast.error("Failed to save scope.");
    }
    finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div
        className={`
          grid grid-cols-1 gap-6
          md:grid-cols-2
        `}
      >
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">Within Scope</h3>
            <p className="text-sm text-muted-foreground">
              Used to nudge the LLM toward topics that fit this radar&apos;s
              focus.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase">Description</label>
            <Textarea
              value={withinDescription}
              onChange={e => setWithinDescription(e.target.value)}
              placeholder="What kinds of topics belong on this radar?"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase">Topics</label>
            <TopicMultiSelect
              options={topics
                .filter(t => !usedExclusionTopicIds.has(t.id))
                .map(t => ({
                  value: t.id,
                  label: t.name,
                }))}
              value={withinTopicIds}
              onChange={setWithinTopicIds}
              placeholder="Add topics in scope..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">Out of Scope</h3>
            <p className="text-sm text-muted-foreground">
              Topics listed here are excluded from the radar. Each can include
              an optional reason explaining why.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase">Description</label>
            <Textarea
              value={outDescription}
              onChange={e => setOutDescription(e.target.value)}
              placeholder="What kinds of topics should be avoided?"
            />
          </div>
          <ul className="flex flex-col gap-3">
            {excludedRows.map(row => (
              <li
                key={row.localKey}
                className="flex flex-col gap-2 rounded-sm border p-3"
              >
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
                        updateExclusion(row.localKey, {
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
                              || (!usedExclusionTopicIds.has(t.id)
                                && !withinTopicIds.includes(t.id)),
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
                      onClick={() => removeExclusion(row.localKey)}
                      aria-label="Remove excluded topic"
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
                      updateExclusion(row.localKey, {
                        reason: e.target.value,
                      })}
                    placeholder="Why should the radar ignore this topic?"
                  />
                </div>
              </li>
            ))}
          </ul>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={addExclusion}
            >
              <PlusIcon />
              {" "}
              Add Excluded Topic
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save Scope
        </Button>
      </div>
    </section>
  );
}
