import type { BulkBlipEntry } from "@/utils";
import type { RadarQuadrant, RadarRing, TopicForTopicsPage } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { Loader2, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/forms/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  bulkCreateRadarBlips,

} from "@/utils";

interface BlipBulkAddProps {
  domainId: string;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  topics: TopicForTopicsPage[];
  onComplete: () => void;
}

interface BulkRow {
  localKey: string;
  topicName: string;
  quadrantId: string;
  ringId: string;
}

interface ResolvedRow {
  topicName: string;
  matchedTopicId: string | null;
  matchedTopicName: string | null;
  quadrantId: string;
  quadrantName: string;
  ringId: string;
  ringName: string;
  willCreateTopic: boolean;
}

let bulkLocalKeyCounter = 0;
function nextBulkLocalKey() {
  bulkLocalKeyCounter += 1;
  return `bulk-${bulkLocalKeyCounter}`;
}

function makeRow(
  defaultQuadrantId: string,
  defaultRingId: string,
): BulkRow {
  return {
    localKey: nextBulkLocalKey(),
    topicName: "",
    quadrantId: defaultQuadrantId,
    ringId: defaultRingId,
  };
}

export function BlipBulkAdd({
  domainId,
  quadrants,
  rings,
  topics,
  onComplete,
}: BlipBulkAddProps) {
  const defaultQuadrantId = quadrants[0]?.id ?? "";
  const defaultRingId = rings[0]?.id ?? "";

  const [rows, setRows] = useState<BulkRow[]>(() => [
    makeRow(defaultQuadrantId, defaultRingId),
  ]);
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topicByLowerName = useMemo(() => {
    const map = new Map<string, TopicForTopicsPage>();
    topics.forEach((t) => {
      map.set(t.name.toLowerCase(), t);
    });
    return map;
  }, [topics]);

  function resolveRows(): ResolvedRow[] {
    return rows
      .filter(r => r.topicName.trim() !== "")
      .map((r) => {
        const trimmed = r.topicName.trim();
        const match = topicByLowerName.get(trimmed.toLowerCase());
        const quadrant = quadrants.find(q => q.id === r.quadrantId);
        const ring = rings.find(r2 => r2.id === r.ringId);
        return {
          topicName: trimmed,
          matchedTopicId: match?.id ?? null,
          matchedTopicName: match?.name ?? null,
          quadrantId: r.quadrantId,
          quadrantName: quadrant?.name ?? "—",
          ringId: r.ringId,
          ringName: ring?.name ?? "—",
          willCreateTopic: !match,
        };
      });
  }

  const resolved = useMemo(resolveRows, [rows, topicByLowerName, quadrants, rings]);
  const newTopicCount = resolved.filter(r => r.willCreateTopic).length;
  const existingMatchCount = resolved.length - newTopicCount;

  function addRow() {
    setRows(prev => [...prev, makeRow(defaultQuadrantId, defaultRingId)]);
  }

  function removeRow(localKey: string) {
    setRows(prev => prev.filter(r => r.localKey !== localKey));
  }

  function updateRow(localKey: string, patch: Partial<BulkRow>) {
    setRows(prev => prev.map(r =>
      r.localKey === localKey
        ? {
          ...r,
          ...patch,
        }
        : r));
  }

  function handleReview() {
    if (resolved.length === 0) {
      toast.error("Add at least one blip with a topic name.");
      return;
    }
    setStep("confirm");
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const blips: BulkBlipEntry[] = resolved.map(r => ({
        topicId: r.matchedTopicId,
        newTopicName: r.matchedTopicId ? null : r.topicName,
        quadrantId: r.quadrantId,
        ringId: r.ringId,
      }));
      const result = await bulkCreateRadarBlips(domainId, {
        blips,
      });
      const skipped = result.skippedDuplicates ?? 0;
      const message = skipped > 0
        ? `Added ${result.count} blip${result.count === 1 ? "" : "s"}; skipped ${skipped} already on the radar.`
        : `Added ${result.count} blip${result.count === 1 ? "" : "s"}.`;
      toast.success(message);
      setRows([makeRow(defaultQuadrantId, defaultRingId)]);
      setStep("input");
      onComplete();
    }
    catch {
      toast.error("Failed to add blips.");
    }
    finally {
      setIsSubmitting(false);
    }
  }

  if (step === "confirm") {
    return (
      <div
        className={`
          flex flex-col gap-4 rounded-sm border border-blue-200 bg-blue-50/50
          p-4
        `}
      >
        <h3 className="text-lg font-semibold">
          Confirm bulk add (
          {resolved.length}
          {" "}
          blip
          {resolved.length === 1 ? "" : "s"}
          )
        </h3>
        <p className="text-sm text-muted-foreground">
          {existingMatchCount}
          {" "}
          will reuse existing topic
          {existingMatchCount === 1 ? "" : "s"}
          ;
          {" "}
          {newTopicCount}
          {" "}
          will create new topic
          {newTopicCount === 1 ? "" : "s"}
          .
        </p>
        <ul className="flex flex-col gap-1 text-sm">
          {resolved.map((r, idx) => (
            <li
              key={`${idx}-${r.topicName}`}
              className={`
                flex flex-row flex-wrap items-center gap-2 rounded-sm bg-white
                px-2 py-1
              `}
            >
              <span className="font-medium">{r.topicName}</span>
              <span className="text-xs text-muted-foreground">
                {r.quadrantName}
                {" "}
                ·
                {r.ringName}
              </span>
              {r.willCreateTopic
                ? (
                  <span
                    className={`
                      rounded-sm bg-emerald-100 px-1.5 py-0.5 text-xs
                      text-emerald-800
                    `}
                  >
                    New topic
                  </span>
                )
                : (
                  <span
                    className={`
                      rounded-sm bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800
                    `}
                  >
                    Existing topic
                  </span>
                )}
            </li>
          ))}
        </ul>
        <div className="flex flex-row gap-2">
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            Confirm and add
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("input")}
            disabled={isSubmitting}
          >
            Back to edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-sm border p-4">
      <h3 className="text-lg font-semibold">Bulk add blips</h3>
      <p className="text-sm text-muted-foreground">
        Enter one topic per row. If the topic name matches an existing topic
        (case-insensitive), the blip reuses it; otherwise a new topic is
        created when you confirm.
      </p>
      <ul className="flex flex-col gap-2">
        {rows.map(row => (
          <li
            key={row.localKey}
            className={`
              grid grid-cols-1 items-center gap-2
              sm:grid-cols-[1fr_1fr_1fr_auto]
            `}
          >
            <Input
              value={row.topicName}
              onChange={e =>
                updateRow(row.localKey, {
                  topicName: e.target.value,
                })}
              placeholder="Topic name"
            />
            <Select
              value={row.quadrantId}
              onValueChange={value =>
                updateRow(row.localKey, {
                  quadrantId: value,
                })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Slice" />
              </SelectTrigger>
              <SelectContent>
                {quadrants.map(q => (
                  <SelectItem
                    key={q.id}
                    value={q.id}
                  >
                    {q.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={row.ringId}
              onValueChange={value =>
                updateRow(row.localKey, {
                  ringId: value,
                })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ring" />
              </SelectTrigger>
              <SelectContent>
                {rings.map(r => (
                  <SelectItem
                    key={r.id}
                    value={r.id}
                  >
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(row.localKey)}
              aria-label="Remove row"
              disabled={rows.length === 1}
            >
              <TrashIcon />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
        >
          <PlusIcon />
          {" "}
          Add row
        </Button>
        <Button
          type="button"
          onClick={handleReview}
        >
          Review (
          {resolved.length}
          )
        </Button>
      </div>
    </div>
  );
}
