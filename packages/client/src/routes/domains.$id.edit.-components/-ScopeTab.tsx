import type { Domain, Radar, TopicForTopicsPage } from "@emstack/types";

import { useEffect, useMemo, useRef, useState } from "react";

import { Loader2, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { TopicMultiSelect } from "./-TopicMultiSelect";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createRadarBlip,
  deleteRadarBlip,
  upsertDomain,
  upsertRadarBlip,
} from "@/utils";

interface ScopeTabProps {
  domain: Domain;
  radar: Radar | undefined;
  topics: TopicForTopicsPage[];
  onSaved: () => Promise<void>;
  onChangeStateChange?: (hasChanges: boolean) => void;
}

// An "ignore" row maps to a radar blip with `isIgnored = true`. `blipId` is
// absent for rows the user just added (created on save).
interface IgnoreRow {
  blipId?: string;
  topicId: string;
  reason: string;
  localKey: string;
}

let ignoreKeyCounter = 0;
function nextIgnoreKey() {
  ignoreKeyCounter += 1;
  return `ignore-${ignoreKeyCounter}`;
}

function buildIgnoreRows(radar: Radar | undefined): IgnoreRow[] {
  return (radar?.blips ?? [])
    .filter(b => b.isIgnored)
    .map(b => ({
      blipId: b.id,
      topicId: b.topicId,
      reason: b.description ?? "",
      localKey: nextIgnoreKey(),
    }));
}

export function ScopeTab({
  domain,
  radar,
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

  const [withinDescription, setWithinDescription] = useState(
    startingWithinDescription,
  );
  const [outDescription, setOutDescription] = useState(startingOutDescription);
  const [withinTopicIds, setWithinTopicIds] = useState<string[]>(
    startingWithinTopicIds,
  );
  const [ignoreRows, setIgnoreRows] = useState<IgnoreRow[]>(() =>
    buildIgnoreRows(radar));
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedRef = useRef({
    withinDescription: startingWithinDescription,
    outDescription: startingOutDescription,
    withinTopicIds: startingWithinTopicIds,
    ignoreRows: buildIgnoreRows(radar),
  });

  // The ignore rows live on the radar query (separate from the domain query),
  // which may resolve after this tab mounts and refetches after a save. Re-sync
  // from the server whenever the set of ignored blips actually changes, so new
  // rows pick up their server-assigned blip ids.
  const serverIgnoreSig = useMemo(
    () =>
      (radar?.blips ?? [])
        .filter(b => b.isIgnored)
        .map(b => `${b.id}:${b.description ?? ""}`)
        .sort()
        .join("|"),
    [radar],
  );
  const lastSyncedSigRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastSyncedSigRef.current === serverIgnoreSig) {
      return;
    }
    lastSyncedSigRef.current = serverIgnoreSig;
    const rows = buildIgnoreRows(radar);
    setIgnoreRows(rows);
    lastSavedRef.current.ignoreRows = rows;
  }, [serverIgnoreSig, radar]);

  const usedIgnoreTopicIds = useMemo(
    () => new Set(ignoreRows.map(r => r.topicId).filter(Boolean)),
    [ignoreRows],
  );

  // Topics already placed on the radar (non-ignored blips) can't also be
  // ignored — a topic has at most one blip per domain.
  const onRadarTopicIds = useMemo(
    () =>
      new Set(
        (radar?.blips ?? []).filter(b => !b.isIgnored).map(b => b.topicId),
      ),
    [radar],
  );

  const hasChanges = useMemo(() => {
    const last = lastSavedRef.current;
    if (withinDescription !== last.withinDescription) return true;
    if (outDescription !== last.outDescription) return true;
    if (
      withinTopicIds.length !== last.withinTopicIds.length
      || withinTopicIds.some((v, i) => v !== last.withinTopicIds[i])
    ) {
      return true;
    }
    if (ignoreRows.length !== last.ignoreRows.length) return true;
    const lastByTopic = new Map(
      last.ignoreRows.map(r => [r.topicId, r.reason]),
    );
    return ignoreRows.some(
      r =>
        !lastByTopic.has(r.topicId) || lastByTopic.get(r.topicId) !== r.reason,
    );
  }, [withinDescription, outDescription, withinTopicIds, ignoreRows]);

  useEffect(() => {
    onChangeStateChange?.(hasChanges);
  }, [hasChanges, onChangeStateChange]);

  function addIgnore() {
    setIgnoreRows(prev => [
      ...prev,
      {
        topicId: "",
        reason: "",
        localKey: nextIgnoreKey(),
      },
    ]);
  }

  function removeIgnore(localKey: string) {
    setIgnoreRows(prev => prev.filter(r => r.localKey !== localKey));
  }

  function updateIgnore(localKey: string, patch: Partial<IgnoreRow>) {
    setIgnoreRows(prev =>
      prev.map(r =>
        r.localKey === localKey
          ? {
            ...r,
            ...patch,
          }
          : r));
  }

  async function handleSave() {
    const cleaned = ignoreRows.filter(r => r.topicId);
    const seen = new Set<string>();
    const deduped = cleaned.filter((r) => {
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
      });

      // Reconcile ignore blips against the server's current ignored blips.
      const serverIgnore = buildIgnoreRows(radar);
      const serverById = new Map(serverIgnore.map(b => [b.blipId, b]));
      const keptBlipIds = new Set(
        deduped.map(r => r.blipId).filter((x): x is string => Boolean(x)),
      );
      for (const b of serverIgnore) {
        if (b.blipId && !keptBlipIds.has(b.blipId)) {
          await deleteRadarBlip(domain.id, b.blipId);
        }
      }
      for (const r of deduped) {
        const reason = r.reason.trim() || null;
        if (r.blipId) {
          const prev = serverById.get(r.blipId);
          const prevReason = prev?.reason.trim() ? prev.reason.trim() : null;
          if (prev && prevReason === reason) continue;
          await upsertRadarBlip(domain.id, r.blipId, {
            topicId: r.topicId,
            description: reason,
            quadrantId: null,
            ringId: null,
            isIgnored: true,
          });
        }
        else {
          await createRadarBlip(domain.id, {
            topicId: r.topicId,
            description: reason,
            quadrantId: null,
            ringId: null,
            isIgnored: true,
          });
        }
      }

      lastSavedRef.current = {
        withinDescription,
        outDescription,
        withinTopicIds,
        ignoreRows: deduped.slice(),
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
                .filter(t => !usedIgnoreTopicIds.has(t.id))
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
            <h3 className="text-xl font-semibold">Out of Scope (Ignored)</h3>
            <p className="text-sm text-muted-foreground">
              Topics listed here are ignored — kept off the radar circle and
              shown in the radar&apos;s Ignored list. Each can include an
              optional reason explaining why.
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
            {ignoreRows.map(row => (
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
                        updateIgnore(row.localKey, {
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
                              || (!usedIgnoreTopicIds.has(t.id)
                                && !withinTopicIds.includes(t.id)
                                && !onRadarTopicIds.has(t.id)),
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
                      onClick={() => removeIgnore(row.localKey)}
                      aria-label="Remove ignored topic"
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
                      updateIgnore(row.localKey, {
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
              onClick={addIgnore}
            >
              <PlusIcon />
              {" "}
              Add Ignored Topic
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
