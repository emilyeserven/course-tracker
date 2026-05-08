import type { BulkBlipEntry } from "@/utils";
import type { RadarQuadrant, RadarRing, TopicForTopicsPage } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { CopyIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/forms/textarea";
import { Button } from "@/components/ui/button";
import {
  bulkCreateRadarBlips,

} from "@/utils";

interface BlipLlmAssistProps {
  domainId: string;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  topics: TopicForTopicsPage[];
  onComplete: () => void;
}

interface LlmEntry {
  topic?: unknown;
  quadrant?: unknown;
  ring?: unknown;
  description?: unknown;
}

interface ResolvedLlmEntry {
  topicName: string;
  matchedTopicId: string | null;
  willCreateTopic: boolean;
  quadrantInput: string;
  quadrantId: string | null;
  ringInput: string;
  ringId: string | null;
  description: string | null;
  isValid: boolean;
  problems: string[];
}

function buildLlmPrompt(quadrants: RadarQuadrant[], rings: RadarRing[]): string {
  const quadrantList = quadrants.map(q => `- ${q.name}`).join("\n");
  const ringList = rings.map(r => `- ${r.name}`).join("\n");
  return `I'm placing topics on a tech-radar style chart.

The radar has these quadrants:
${quadrantList || "- (none defined)"}

And these rings (innermost first):
${ringList || "- (none defined)"}

Please return ONLY a JSON array of entries, one per topic you suggest, using
this exact shape (no other keys, no commentary):

[
  {
    "topic": "Topic name",
    "quadrant": "One of the quadrant names above (exact match)",
    "ring": "One of the ring names above (exact match)",
    "description": "Optional one-line note (or null)"
  }
]
`;
}

export function BlipLlmAssist({
  domainId,
  quadrants,
  rings,
  topics,
  onComplete,
}: BlipLlmAssistProps) {
  const prompt = useMemo(
    () => buildLlmPrompt(quadrants, rings),
    [quadrants, rings],
  );

  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolvedLlmEntry[] | null>(null);
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

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("Prompt copied to clipboard.");
    }
    catch {
      toast.error("Couldn't access the clipboard.");
    }
  }

  function parseAndResolve() {
    setParseError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    }
    catch (err) {
      const message = err instanceof Error ? err.message : "Invalid JSON";
      setParseError(message);
      setResolved(null);
      return;
    }
    if (!Array.isArray(parsed)) {
      setParseError("Expected a JSON array.");
      setResolved(null);
      return;
    }

    const entries = parsed as LlmEntry[];
    const out: ResolvedLlmEntry[] = entries.map((entry) => {
      const problems: string[] = [];
      const topicName = typeof entry.topic === "string" ? entry.topic.trim() : "";
      const quadrantInput
        = typeof entry.quadrant === "string" ? entry.quadrant.trim() : "";
      const ringInput = typeof entry.ring === "string" ? entry.ring.trim() : "";
      const description = typeof entry.description === "string"
        ? entry.description.trim() || null
        : null;

      if (!topicName) {
        problems.push("missing topic");
      }
      const quadrantMatch = quadrantInput
        ? quadrantByLowerName.get(quadrantInput.toLowerCase())
        : undefined;
      if (!quadrantMatch) {
        problems.push(
          quadrantInput
            ? `unknown quadrant "${quadrantInput}"`
            : "missing quadrant",
        );
      }
      const ringMatch = ringInput
        ? ringByLowerName.get(ringInput.toLowerCase())
        : undefined;
      if (!ringMatch) {
        problems.push(
          ringInput ? `unknown ring "${ringInput}"` : "missing ring",
        );
      }

      const topicMatch = topicName
        ? topicByLowerName.get(topicName.toLowerCase())
        : undefined;

      return {
        topicName,
        matchedTopicId: topicMatch?.id ?? null,
        willCreateTopic: !!topicName && !topicMatch,
        quadrantInput,
        quadrantId: quadrantMatch?.id ?? null,
        ringInput,
        ringId: ringMatch?.id ?? null,
        description,
        isValid: problems.length === 0,
        problems,
      };
    });
    setResolved(out);
  }

  async function handleConfirm() {
    if (!resolved) {
      return;
    }
    const validEntries = resolved.filter(r => r.isValid);
    if (validEntries.length === 0) {
      toast.error("No valid entries to add.");
      return;
    }
    setIsSubmitting(true);
    try {
      const blips: BulkBlipEntry[] = validEntries
        .filter(r => r.quadrantId !== null && r.ringId !== null)
        .map(r => ({
          topicId: r.matchedTopicId,
          newTopicName: r.matchedTopicId ? null : r.topicName,
          quadrantId: r.quadrantId as string,
          ringId: r.ringId as string,
          description: r.description,
        }));
      const result = await bulkCreateRadarBlips(domainId, {
        blips,
      });
      toast.success(
        `Added ${result.count} blip${result.count === 1 ? "" : "s"}.`,
      );
      setJsonText("");
      setResolved(null);
      onComplete();
    }
    catch {
      toast.error("Failed to add blips.");
    }
    finally {
      setIsSubmitting(false);
    }
  }

  const newTopicCount = resolved?.filter(r => r.willCreateTopic && r.isValid).length ?? 0;
  const validCount = resolved?.filter(r => r.isValid).length ?? 0;
  const invalidCount = (resolved?.length ?? 0) - validCount;

  return (
    <div className="flex flex-col gap-4 rounded-sm border p-4">
      <h3 className="text-lg font-semibold">LLM Assisted Mode</h3>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <label className="text-sm font-medium">
            1. Copy this prompt into an LLM
          </label>
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
            max-h-60 overflow-auto rounded-sm bg-muted p-3 text-xs
            whitespace-pre-wrap
          `}
        >
          {prompt}
        </pre>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">2. Paste the JSON response</label>
        <Textarea
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          placeholder='[{ "topic": "...", "quadrant": "...", "ring": "..." }]'
          className="min-h-32 font-mono text-xs"
        />
        {parseError && (
          <p className="text-sm text-destructive">{parseError}</p>
        )}
        <div>
          <Button
            type="button"
            onClick={parseAndResolve}
            disabled={!jsonText.trim()}
          >
            Parse & review
          </Button>
        </div>
      </div>

      {resolved && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold">3. Review</h4>
          <p className="text-sm text-muted-foreground">
            {validCount}
            {" "}
            valid ·
            {" "}
            {invalidCount}
            {" "}
            problem
            {invalidCount === 1 ? "" : "s"}
            {" "}
            ·
            {" "}
            {newTopicCount}
            {" "}
            new topic
            {newTopicCount === 1 ? "" : "s"}
            {" "}
            to create
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {resolved.map((r, idx) => (
              <li
                key={idx}
                className={`
                  flex flex-row flex-wrap items-center gap-2 rounded-sm border
                  px-2 py-1
                  ${r.isValid ? "bg-white" : "border-red-200 bg-red-50"}
                `}
              >
                <span className="font-medium">{r.topicName || "(no topic)"}</span>
                <span className="text-xs text-muted-foreground">
                  {r.quadrantInput || "?"}
                  {" "}
                  ·
                  {r.ringInput || "?"}
                </span>
                {r.isValid && r.willCreateTopic && (
                  <span
                    className={`
                      rounded-sm bg-emerald-100 px-1.5 py-0.5 text-xs
                      text-emerald-800
                    `}
                  >
                    New topic
                  </span>
                )}
                {r.isValid && !r.willCreateTopic && (
                  <span
                    className={`
                      rounded-sm bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800
                    `}
                  >
                    Existing topic
                  </span>
                )}
                {!r.isValid && (
                  <span
                    className={`
                      rounded-sm bg-red-100 px-1.5 py-0.5 text-xs text-red-800
                    `}
                  >
                    {r.problems.join("; ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || validCount === 0}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Confirm & add (
              {validCount}
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
