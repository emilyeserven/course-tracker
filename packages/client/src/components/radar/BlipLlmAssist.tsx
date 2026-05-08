import type { BulkBlipEntry } from "@/utils";
import type {
  DomainExcludedTopic,
  DomainTopic,
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types/src";

import { useMemo, useState } from "react";

import { CopyIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/forms/textarea";
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
  upsertRadarBlip,
} from "@/utils";

interface BlipLlmAssistProps {
  domainId: string;
  domainTitle: string;
  domainDescription?: string | null;
  domainTopics?: DomainTopic[];
  excludedTopics?: DomainExcludedTopic[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  topics: TopicForTopicsPage[];
  existingBlips: RadarBlip[];
  onComplete: () => void;
}

type Resolution = "create" | "overwrite" | "updateDescription" | "skip";

interface LlmEntry {
  topic?: unknown;
  quadrant?: unknown;
  ring?: unknown;
  description?: unknown;
  radarNote?: unknown;
}

interface ResolvedLlmEntry {
  topicName: string;
  matchedTopicId: string | null;
  willCreateTopic: boolean;
  quadrantInput: string;
  quadrantId: string | null;
  ringInput: string;
  ringId: string | null;
  topicDescription: string | null;
  radarNote: string | null;
  existingBlipId: string | null;
  existingQuadrantId: string | null;
  existingRingId: string | null;
  existingDescription: string | null;
  resolution: Resolution;
  problems: string[];
}

function computeProblems(
  entry: Pick<ResolvedLlmEntry,
    "topicName" | "quadrantInput" | "quadrantId" | "ringInput" | "ringId">,
  excludedNames?: Set<string>,
): string[] {
  const problems: string[] = [];
  if (!entry.topicName) {
    problems.push("missing topic");
  }
  else if (excludedNames?.has(entry.topicName.toLowerCase())) {
    problems.push("topic is excluded from this radar");
  }
  if (!entry.quadrantId) {
    problems.push(
      entry.quadrantInput
        ? `unknown quadrant "${entry.quadrantInput}"`
        : "missing quadrant",
    );
  }
  if (!entry.ringId) {
    problems.push(
      entry.ringInput ? `unknown ring "${entry.ringInput}"` : "missing ring",
    );
  }
  return problems;
}

function describeProgress(course: {
  progressCurrent?: number | null;
  progressTotal?: number | null;
  status?: string | null;
}): string {
  const parts: string[] = [];
  const current = course.progressCurrent ?? 0;
  const total = course.progressTotal ?? 0;
  if (total > 0) {
    const pct = Math.round((current / total) * 100);
    parts.push(`${current}/${total} (${pct}%)`);
  }
  else if (current > 0) {
    parts.push(`${current} done`);
  }
  if (course.status) {
    parts.push(course.status);
  }
  return parts.length > 0 ? ` — ${parts.join(", ")}` : "";
}

function formatTopicsWithCourses(domainTopics: DomainTopic[]): string {
  if (!domainTopics || domainTopics.length === 0) {
    return "- (no topics linked to this domain yet)";
  }
  return domainTopics
    .map((topic) => {
      const lines: string[] = [];
      lines.push(`- ${topic.name}`);
      const courses = topic.courses ?? [];
      if (courses.length === 0) {
        lines.push("  - (no courses)");
      }
      else {
        for (const course of courses) {
          lines.push(`  - ${course.name}${describeProgress(course)}`);
        }
      }
      return lines.join("\n");
    })
    .join("\n");
}

function formatExcludedTopics(excluded: DomainExcludedTopic[]): string {
  if (!excluded || excluded.length === 0) {
    return "- (none)";
  }
  return excluded
    .map((row) => {
      const reason = row.reason?.trim();
      return reason ? `- ${row.name} — ${reason}` : `- ${row.name}`;
    })
    .join("\n");
}

interface BuildPromptArgs {
  domainTitle: string;
  domainDescription?: string | null;
  domainTopics: DomainTopic[];
  excludedTopics: DomainExcludedTopic[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  existingBlips: { topicName: string;
    radarNote?: string | null;
    topicDescription?: string | null; }[];
}

function buildLlmPrompt(args: BuildPromptArgs): string {
  const {
    domainTitle,
    domainDescription,
    domainTopics,
    excludedTopics,
    quadrants,
    rings,
    existingBlips,
  } = args;

  const quadrantList = quadrants.map(q => `- ${q.name}`).join("\n");
  const ringList = rings.map(r => `- ${r.name}`).join("\n");
  const domainLabel = domainTitle.trim() || "(unnamed domain)";
  const descriptionBlock = domainDescription?.trim()
    ? domainDescription.trim()
    : "(no description provided)";
  const existingList = existingBlips.length > 0
    ? existingBlips
      .map((b) => {
        const note = b.radarNote?.trim();
        const topicDesc = b.topicDescription?.trim();
        const lines = [`- ${b.topicName}`];
        lines.push(
          topicDesc
            ? `  - general description: ${topicDesc}`
            : `  - general description: (missing — supply one in your output if you keep this blip)`,
        );
        lines.push(`  - radar note: ${note || "(none)"}`);
        return lines.join("\n");
      })
      .join("\n")
    : "- (none yet)";

  return `I'm placing topics on a tech-radar style chart for the "${domainLabel}" domain.

Domain description:
${descriptionBlock}

The radar has these quadrants:
${quadrantList || "- (none defined)"}

And these rings (innermost first):
${ringList || "- (none defined)"}

Topics already linked to this domain, with the courses I'm taking and current
progress for each (use this to gauge what I've actually been investing time in).
The course list under each topic is NOT exhaustive — I may have studied related
material outside of what's listed, or just not added it to the system yet — so
treat course progress as a signal, not the full picture:
${formatTopicsWithCourses(domainTopics)}

Topics already on the radar, with each topic's general description (if any)
and its current radar note (if any). If the general description is marked
missing for a topic you keep in your output, supply a description in the
result so it gets filled in:
${existingList}

Topics I have explicitly EXCLUDED from this radar — do NOT suggest these,
even with a different note or placement. The reason for each is in
parentheses; treat the reasons as binding context for what I don't want:
${formatExcludedTopics(excludedTopics)}

Please suggest topics relevant to the "${domainLabel}" domain and return ONLY a
JSON array of entries, using this exact shape (no other keys, no commentary):

[
  {
    "topic": "Topic name",
    "description": "A short factual description of what the topic IS — saved as the topic's description if the topic is new, or if the topic exists but has no description yet (marked missing above). Null only when the topic already has a description and you have nothing to add.",
    "radarNote": "A short note explaining WHY this topic belongs on the radar in this quadrant/ring. Keep high-level framing to a minimum; prefer specific, concrete references — which courses, projects, prior placements, or trade-offs drive the choice — over generic justifications. Null if no note.",
    "quadrant": "One of the quadrant names above (exact match)",
    "ring": "One of the ring names above (exact match)"
  }
]

The "description" describes the topic itself (it's saved when the topic is
new, or when an existing topic has no description yet — otherwise it's
ignored). The "radarNote" is the reasoning for this specific radar placement
and is always saved as the blip's note.

You may include topics already on the radar to suggest a better radar note or
a different placement for them. The reviewer will choose whether to overwrite,
update only the radar note, or skip each one. Do not include any topic from
the excluded list above.
`;
}

export function BlipLlmAssist({
  domainId,
  domainTitle,
  domainDescription = null,
  domainTopics = [],
  excludedTopics = [],
  quadrants,
  rings,
  topics,
  existingBlips,
  onComplete,
}: BlipLlmAssistProps) {
  const prompt = useMemo(
    () => {
      const topicById = new Map(topics.map(t => [t.id, t]));
      return buildLlmPrompt({
        domainTitle,
        domainDescription,
        domainTopics,
        excludedTopics,
        quadrants,
        rings,
        existingBlips: existingBlips.map(b => ({
          topicName: b.topicName,
          radarNote: b.description,
          topicDescription: topicById.get(b.topicId)?.description ?? null,
        })),
      });
    },
    [
      domainTitle,
      domainDescription,
      domainTopics,
      excludedTopics,
      quadrants,
      rings,
      existingBlips,
      topics,
    ],
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

  const excludedNamesLower = useMemo(() => {
    const set = new Set<string>();
    excludedTopics.forEach((t) => {
      if (t.name) {
        set.add(t.name.toLowerCase());
      }
    });
    return set;
  }, [excludedTopics]);

  async function copyPrompt() {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(prompt);
        toast.success("Prompt copied to clipboard.");
        return;
      }
      catch {
        // Fall through to the textarea fallback below.
      }
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) {
        toast.success("Prompt copied to clipboard.");
      }
      else {
        toast.error("Couldn't copy — please select and copy manually.");
      }
    }
    catch {
      toast.error("Couldn't copy — please select and copy manually.");
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
      const topicName = typeof entry.topic === "string" ? entry.topic.trim() : "";
      const quadrantInput
        = typeof entry.quadrant === "string" ? entry.quadrant.trim() : "";
      const ringInput = typeof entry.ring === "string" ? entry.ring.trim() : "";
      const topicDescription = typeof entry.description === "string"
        ? entry.description.trim() || null
        : null;
      const radarNote = typeof entry.radarNote === "string"
        ? entry.radarNote.trim() || null
        : null;

      const quadrantMatch = quadrantInput
        ? quadrantByLowerName.get(quadrantInput.toLowerCase())
        : undefined;
      const ringMatch = ringInput
        ? ringByLowerName.get(ringInput.toLowerCase())
        : undefined;
      const topicMatch = topicName
        ? topicByLowerName.get(topicName.toLowerCase())
        : undefined;
      const existingBlip = topicMatch
        ? existingBlipByTopicId.get(topicMatch.id) ?? null
        : null;

      const partial = {
        topicName,
        quadrantInput,
        quadrantId: quadrantMatch?.id ?? null,
        ringInput,
        ringId: ringMatch?.id ?? null,
      };

      const isExcluded = excludedNamesLower.has(topicName.toLowerCase());
      return {
        ...partial,
        matchedTopicId: topicMatch?.id ?? null,
        willCreateTopic: !!topicName && !topicMatch,
        topicDescription,
        radarNote,
        existingBlipId: existingBlip?.id ?? null,
        existingQuadrantId: existingBlip?.quadrantId ?? null,
        existingRingId: existingBlip?.ringId ?? null,
        existingDescription: existingBlip?.description ?? null,
        resolution: isExcluded
          ? "skip"
          : existingBlip
            ? "overwrite"
            : "create",
        problems: computeProblems(partial, excludedNamesLower),
      };
    });
    setResolved(out);
  }

  function updateEntry(idx: number, patch: Partial<ResolvedLlmEntry>) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) => {
        if (i !== idx) {
          return entry;
        }
        const next = {
          ...entry,
          ...patch,
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function isActionable(r: ResolvedLlmEntry): boolean {
    if (r.resolution === "skip") {
      return false;
    }
    if (r.resolution === "updateDescription") {
      return r.existingBlipId !== null;
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
      const toOverwrite = actionable.filter(
        r => r.resolution === "overwrite" && r.existingBlipId,
      );
      const toUpdateDescription = actionable.filter(
        r => r.resolution === "updateDescription" && r.existingBlipId,
      );
      const toCreate = actionable.filter(r => r.resolution === "create");

      let overwriteCount = 0;
      for (const r of toOverwrite) {
        await upsertRadarBlip(domainId, r.existingBlipId as string, {
          topicId: r.matchedTopicId as string,
          quadrantId: r.quadrantId as string,
          ringId: r.ringId as string,
          description: r.radarNote,
        });
        overwriteCount += 1;
      }

      let descriptionUpdateCount = 0;
      for (const r of toUpdateDescription) {
        await upsertRadarBlip(domainId, r.existingBlipId as string, {
          topicId: r.matchedTopicId as string,
          quadrantId: r.existingQuadrantId as string,
          ringId: r.existingRingId as string,
          description: r.radarNote,
        });
        descriptionUpdateCount += 1;
      }

      let createCount = 0;
      if (toCreate.length > 0) {
        const blips: BulkBlipEntry[] = toCreate.map(r => ({
          topicId: r.matchedTopicId,
          newTopicName: r.matchedTopicId ? null : r.topicName,
          newTopicDescription: r.matchedTopicId ? null : r.topicDescription,
          quadrantId: r.quadrantId as string,
          ringId: r.ringId as string,
          description: r.radarNote,
        }));
        const result = await bulkCreateRadarBlips(domainId, {
          blips,
        });
        createCount = result.count;
      }

      const parts: string[] = [];
      if (createCount > 0) {
        parts.push(`added ${createCount}`);
      }
      if (overwriteCount > 0) {
        parts.push(`updated ${overwriteCount}`);
      }
      if (descriptionUpdateCount > 0) {
        parts.push(`described ${descriptionUpdateCount}`);
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

  const newTopicCount = resolved?.filter(
    r => r.willCreateTopic && r.problems.length === 0 && r.resolution !== "skip",
  ).length ?? 0;
  const createCount = resolved?.filter(
    r => r.resolution === "create" && r.problems.length === 0,
  ).length ?? 0;
  const overwriteCount = resolved?.filter(
    r => r.resolution === "overwrite" && r.problems.length === 0,
  ).length ?? 0;
  const descriptionUpdateCount = resolved?.filter(
    r => r.resolution === "updateDescription" && r.existingBlipId,
  ).length ?? 0;
  const skipCount = resolved?.filter(r => r.resolution === "skip").length ?? 0;
  const problemCount = resolved?.filter(
    r => r.problems.length > 0
      && r.resolution !== "skip"
      && r.resolution !== "updateDescription",
  ).length ?? 0;
  const actionableCount = createCount + overwriteCount + descriptionUpdateCount;

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
          placeholder='[{ "topic": "...", "description": "...", "radarNote": "...", "quadrant": "...", "ring": "..." }]'
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
            {createCount}
            {" "}
            to add ·
            {" "}
            {overwriteCount}
            {" "}
            to overwrite ·
            {" "}
            {descriptionUpdateCount}
            {" "}
            note
            {descriptionUpdateCount === 1 ? "" : "s"}
            {" "}
            to update ·
            {" "}
            {skipCount}
            {" "}
            to skip ·
            {" "}
            {problemCount}
            {" "}
            problem
            {problemCount === 1 ? "" : "s"}
            {" "}
            ·
            {" "}
            {newTopicCount}
            {" "}
            new topic
            {newTopicCount === 1 ? "" : "s"}
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {resolved.map((r, idx) => {
              const hasProblems = r.problems.length > 0;
              const isSkipped = r.resolution === "skip";
              const conflicts = r.existingBlipId !== null;
              const existingQuadrantName = r.existingQuadrantId
                ? quadrantById.get(r.existingQuadrantId)?.name ?? "?"
                : null;
              const existingRingName = r.existingRingId
                ? ringById.get(r.existingRingId)?.name ?? "?"
                : null;
              return (
                <li
                  key={idx}
                  className={`
                    flex flex-col gap-2 rounded-sm border px-3 py-2
                    ${isSkipped
                  ? "border-muted bg-muted/30 opacity-70"
                  : hasProblems
                    ? "border-red-200 bg-red-50"
                    : conflicts
                      ? "border-amber-300 bg-amber-50"
                      : "bg-white"}
                  `}
                >
                  <div className="flex flex-row flex-wrap items-center gap-2">
                    <span className="font-medium">{r.topicName || "(no topic)"}</span>
                    {r.willCreateTopic && (
                      <span
                        className={`
                          rounded-sm bg-emerald-100 px-1.5 py-0.5 text-xs
                          text-emerald-800
                        `}
                      >
                        New topic
                      </span>
                    )}
                    {!r.willCreateTopic && r.matchedTopicId && (
                      <span
                        className={`
                          rounded-sm bg-blue-100 px-1.5 py-0.5 text-xs
                          text-blue-800
                        `}
                      >
                        Existing topic
                      </span>
                    )}
                    {conflicts && (
                      <span
                        className={`
                          rounded-sm bg-amber-200 px-1.5 py-0.5 text-xs
                          text-amber-900
                        `}
                      >
                        Already on radar
                      </span>
                    )}
                    {hasProblems && !isSkipped && (
                      <span
                        className={`
                          rounded-sm bg-red-100 px-1.5 py-0.5 text-xs
                          text-red-800
                        `}
                      >
                        {r.problems.join("; ")}
                      </span>
                    )}
                  </div>

                  {conflicts && (
                    <div className="text-xs text-muted-foreground">
                      Currently:
                      {" "}
                      <span className="font-medium">
                        {existingQuadrantName ?? "?"}
                        {" · "}
                        {existingRingName ?? "?"}
                      </span>
                      {r.existingDescription && (
                        <>
                          {" — note: "}
                          <span className="italic">{r.existingDescription}</span>
                        </>
                      )}
                    </div>
                  )}

                  {r.willCreateTopic && r.topicDescription && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium uppercase">
                        Topic description (new):
                      </span>
                      {" "}
                      <span className="italic">{r.topicDescription}</span>
                    </div>
                  )}

                  {r.radarNote && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium uppercase">Radar note:</span>
                      {" "}
                      <span className="italic">{r.radarNote}</span>
                    </div>
                  )}

                  <div
                    className={`
                      grid grid-cols-1 gap-2
                      sm:grid-cols-3
                    `}
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground uppercase">
                        Quadrant
                        {r.quadrantInput && (
                          <>
                            {" "}
                            <span
                              className="text-muted-foreground/70 normal-case"
                            >
                              (LLM:
                              {" "}
                              {r.quadrantInput}
                              )
                            </span>
                          </>
                        )}
                      </label>
                      <Select
                        value={r.quadrantId ?? ""}
                        onValueChange={value =>
                          updateEntry(idx, {
                            quadrantId: value || null,
                          })}
                        disabled={isSkipped || r.resolution === "updateDescription"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a quadrant" />
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
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground uppercase">
                        Ring
                        {r.ringInput && (
                          <>
                            {" "}
                            <span
                              className="text-muted-foreground/70 normal-case"
                            >
                              (LLM:
                              {" "}
                              {r.ringInput}
                              )
                            </span>
                          </>
                        )}
                      </label>
                      <Select
                        value={r.ringId ?? ""}
                        onValueChange={value =>
                          updateEntry(idx, {
                            ringId: value || null,
                          })}
                        disabled={isSkipped || r.resolution === "updateDescription"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a ring" />
                        </SelectTrigger>
                        <SelectContent>
                          {rings.map(rg => (
                            <SelectItem
                              key={rg.id}
                              value={rg.id}
                            >
                              {rg.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground uppercase">
                        Action
                      </label>
                      <Select
                        value={r.resolution}
                        onValueChange={value =>
                          updateEntry(idx, {
                            resolution: value as Resolution,
                          })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conflicts
                            ? (
                              <>
                                <SelectItem value="overwrite">
                                  Overwrite existing
                                </SelectItem>
                                <SelectItem value="updateDescription">
                                  Update radar note only
                                </SelectItem>
                                <SelectItem value="skip">
                                  Skip (keep existing)
                                </SelectItem>
                              </>
                            )
                            : (
                              <>
                                <SelectItem value="create">Add</SelectItem>
                                <SelectItem value="skip">Skip</SelectItem>
                              </>
                            )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
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
