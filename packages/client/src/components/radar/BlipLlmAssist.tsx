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

import { CheckIcon, CopyIcon, Loader2, PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bulkCreateRadarBlips,
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

type Resolution
  = | "create"
    | "overwriteAll"
    | "updateBlip"
    | "removeBlip"
    | "skip";

function stripCodeFence(input: string): string {
  const trimmed = input.trim();
  const fenceMatch = trimmed.match(/^```[^\n]*\n([\s\S]*?)\n?```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function isNoChangeSentinel(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === "no change" || v === "no-change" || v === "nochange";
}

interface LlmEntry {
  topic?: unknown;
  quadrant?: unknown;
  ring?: unknown;
  description?: unknown;
  radarNote?: unknown;
  action?: unknown;
}

interface EditDraft {
  description: string;
  radarNote: string;
  quadrantId: string;
  ringId: string;
}

interface ResolvedLlmEntry {
  topicName: string;
  matchedTopicId: string | null;
  willCreateTopic: boolean;

  quadrantInput: string;
  ringInput: string;

  // Effective values (initially the LLM's, replaced by user edits)
  description: string | null;
  radarNote: string | null;
  quadrantId: string | null;
  ringId: string | null;

  // Existing state at parse time
  existingBlipId: string | null;
  existingQuadrantId: string | null;
  existingRingId: string | null;
  existingRadarNote: string | null;
  existingTopicDescription: string | null;

  // Topic association counts (for delete-topic safety check)
  topicCourseCount: number;
  topicTaskCount: number;
  topicDailyCount: number;

  resolution: Resolution;
  deleteTopicOnRemove: boolean;
  editing: boolean;
  editDraft: EditDraft | null;

  selected: boolean;

  problems: string[];
}

function computeProblems(
  entry: Pick<ResolvedLlmEntry,
  "topicName" | "quadrantInput" | "quadrantId" | "ringInput" | "ringId"
  | "resolution" | "existingBlipId">,
  excludedNames?: Set<string>,
): string[] {
  const problems: string[] = [];
  if (!entry.topicName) {
    problems.push("missing topic");
  }
  else if (excludedNames?.has(entry.topicName.toLowerCase())) {
    problems.push("topic is excluded from this radar");
  }
  // Skip and remove resolutions don't need quadrant/ring validation.
  if (entry.resolution === "skip") {
    return problems;
  }
  if (entry.resolution === "removeBlip") {
    if (!entry.existingBlipId) {
      problems.push("no existing blip to remove");
    }
    return problems;
  }
  if (entry.resolution === "updateBlip") {
    if (!entry.existingBlipId) {
      problems.push("no existing blip to update");
    }
    return problems;
  }
  if (!entry.quadrantId) {
    problems.push(
      entry.quadrantInput
        ? `unknown slice "${entry.quadrantInput}"`
        : "missing slice",
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

type PromptMode = "setup" | "cleanup";

interface BuildPromptArgs {
  domainTitle: string;
  domainDescription?: string | null;
  domainTopics: DomainTopic[];
  excludedTopics: DomainExcludedTopic[];
  withinScopeDescription?: string | null;
  outOfScopeDescription?: string | null;
  withinScopeTopicNames?: string[];
  outOfScopeTopicNames?: string[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  existingBlips: { topicName: string;
    radarNote?: string | null;
    topicDescription?: string | null;
    currentSliceName?: string | null;
    currentRingName?: string | null; }[];
}

interface BuildCleanupPromptArgs {
  domainTitle: string;
  domainDescription?: string | null;
  withinScopeDescription?: string | null;
  outOfScopeDescription?: string | null;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  unassignedBlips: { topicName: string;
    quadrantName: string | null;
    ringName: string | null;
    radarNote?: string | null;
    topicDescription?: string | null; }[];
}

function formatTopicNameList(names: string[] | undefined): string {
  if (!names || names.length === 0) {
    return "- (none)";
  }
  return names.map(n => `- ${n}`).join("\n");
}

function buildLlmPrompt(args: BuildPromptArgs): string {
  const {
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
  } = args;

  const adoptedRing = rings.find(r => r.isAdopted);
  const quadrantList = quadrants.map(q => `- ${q.name}`).join("\n");
  const ringList = rings.map((r) => {
    if (r.isAdopted) {
      return `- ${r.name} (use for foundational topics that are fully established and no longer being actively evaluated; a slice is still meaningful for grouping)`;
    }
    return `- ${r.name}`;
  }).join("\n");
  const domainLabel = domainTitle.trim() || "(unnamed domain)";
  const descriptionBlock = domainDescription?.trim()
    ? domainDescription.trim()
    : "(no description provided)";
  const existingList = existingBlips.length > 0
    ? existingBlips
      .map((b) => {
        const note = b.radarNote?.trim();
        const topicDesc = b.topicDescription?.trim();
        const slice = b.currentSliceName?.trim();
        const ring = b.currentRingName?.trim();
        const lines = [`- ${b.topicName}`];
        lines.push(
          `  - current placement: ${slice || "(no slice)"} / ${ring || "(no ring)"}`,
        );
        lines.push(
          topicDesc
            ? `  - general description: ${topicDesc}`
            : "  - general description: (missing — supply one in your output if you keep this blip)",
        );
        lines.push(`  - radar note: ${note || "(none)"}`);
        return lines.join("\n");
      })
      .join("\n")
    : "- (none yet)";
  const adoptedClause = adoptedRing
    ? `\nThe "${adoptedRing.name}" ring is for topics that are fully established
and no longer under active evaluation — graduated from the trial/assess flow.
You may suggest moving topics into or out of "${adoptedRing.name}" when that
matches the topic's maturity. A slice is still meaningful for "${adoptedRing.name}"
topics (it groups them by category), so include both quadrant and ring.`
    : "";

  const withinScopeBlock = withinScopeDescription?.trim()
    ? withinScopeDescription.trim()
    : "(no within-scope description provided)";
  const outOfScopeBlock = outOfScopeDescription?.trim()
    ? outOfScopeDescription.trim()
    : "(no out-of-scope description provided)";

  // The JSON key below stays "quadrant" for parser compatibility with
  // existing pasted responses; only the surrounding prose says "slice".
  return `I'm placing topics on a tech-radar style chart for the "${domainLabel}" domain.

Domain description:
${descriptionBlock}

Within-scope description (lean toward topics like these):
${withinScopeBlock}

Within-scope topics (representative examples of what fits this radar):
${formatTopicNameList(withinScopeTopicNames)}

Out-of-scope description (lean away from topics like these):
${outOfScopeBlock}

Out-of-scope topics (representative examples of what does NOT fit):
${formatTopicNameList(outOfScopeTopicNames)}

The radar has these slices:
${quadrantList || "- (none defined)"}

And these rings (innermost first):
${ringList || "- (none defined)"}

Topics already linked to this domain, with the courses I'm taking and current
progress for each (use this to gauge what I've actually been investing time in).
The course list under each topic is NOT exhaustive — I may have studied related
material outside of what's listed, or just not added it to the system yet — so
treat course progress as a signal, not the full picture:
${formatTopicsWithCourses(domainTopics)}

Topics already on the radar, with each topic's general description (if any),
current placement, and its current radar note (if any). If the general
description is marked missing for a topic you keep in your output, supply a
description in the result so it gets filled in:
${existingList}
${adoptedClause}

Topics I have explicitly EXCLUDED from this radar — do NOT suggest these,
even with a different note or placement. The reason for each is in
parentheses; treat the reasons as binding context for what I don't want:
${formatExcludedTopics(excludedTopics)}

Please suggest topics relevant to the "${domainLabel}" domain and return ONLY a
JSON array of entries, using this exact shape (no other keys, no commentary):

[
  {
    "topic": "Topic name",
    "action": "add | update | remove (optional — see below)",
    "description": "A short factual description of what the topic IS — saved as the topic's description if the topic is new, or if the topic exists but has no description yet (marked missing above). For an existing topic that already has a description, use the literal string \\"no change\\" to keep its current description as-is. Use null ONLY when you explicitly want to ERASE the existing description (this will wipe it out — do not use null just to mean \\"nothing to add\\").",
    "radarNote": "A short note explaining WHY this topic belongs on the radar in this slice/ring. Keep high-level framing to a minimum; prefer specific, concrete references — which courses, projects, prior placements, or trade-offs drive the choice — over generic justifications. For an existing blip whose current note is fine, use the literal string \\"no change\\" to keep it as-is. Use null ONLY to ERASE the existing note (or to leave a brand-new blip without a note).",
    "quadrant": "One of the slice names above (exact match) — null/omit if action is remove (JSON key stays \\"quadrant\\" for compatibility)",
    "ring": "One of the ring names above (exact match) — null/omit if action is remove"
  }
]

The optional "action" field tells me what to do with the topic:
- "add" — propose a new blip (default for topics not currently on the radar).
- "update" — keep the topic on the radar but suggest a different placement
  and/or radar note (default for topics already on the radar).
- "remove" — the topic is currently on the radar but no longer fits this
  domain's focus; propose taking it off. Include a brief radar note
  explaining why (or null). slice and ring may be omitted.

If you omit "action" I'll default it from whether the topic is already on the
radar. Only suggest "remove" for topics from the existing-on-radar list above.

The "description" describes the topic itself (it's saved when the topic is
new, or when an existing topic has no description yet — otherwise it's
ignored). The "radarNote" is the reasoning for this specific radar placement
and is always saved as the blip's note.

You may include topics already on the radar to suggest a better radar note,
a different placement, or removal. The reviewer will choose whether to
overwrite, update only, remove, or skip each one. Do not include any topic
from the excluded list above.
`;
}

function buildCleanupPrompt(args: BuildCleanupPromptArgs): string {
  const {
    domainTitle,
    domainDescription,
    withinScopeDescription,
    outOfScopeDescription,
    quadrants,
    rings,
    unassignedBlips,
  } = args;

  const adoptedRing = rings.find(r => r.isAdopted);
  const quadrantList = quadrants.map(q => `- ${q.name}`).join("\n");
  const ringList = rings.map((r) => {
    if (r.isAdopted) {
      return `- ${r.name} (use for foundational topics that are fully established and no longer being actively evaluated; a slice is still meaningful for grouping)`;
    }
    return `- ${r.name}`;
  }).join("\n");
  const domainLabel = domainTitle.trim() || "(unnamed domain)";
  const descriptionBlock = domainDescription?.trim()
    ? domainDescription.trim()
    : "(no description provided)";
  const withinScopeBlock = withinScopeDescription?.trim()
    ? withinScopeDescription.trim()
    : "(no within-scope description provided)";
  const outOfScopeBlock = outOfScopeDescription?.trim()
    ? outOfScopeDescription.trim()
    : "(no out-of-scope description provided)";

  const blipList = unassignedBlips.length > 0
    ? unassignedBlips
      .map((b) => {
        const lines = [`- ${b.topicName}`];
        const desc = b.topicDescription?.trim();
        const note = b.radarNote?.trim();
        if (desc) {
          lines.push(`  - description: ${desc}`);
        }
        if (note) {
          lines.push(`  - radar note: ${note}`);
        }
        const status: string[] = [];
        if (!b.quadrantName) status.push("missing slice");
        if (!b.ringName) status.push("missing ring");
        if (b.quadrantName) status.push(`current slice: ${b.quadrantName}`);
        if (b.ringName) status.push(`current ring: ${b.ringName}`);
        lines.push(`  - status: ${status.join(", ")}`);
        return lines.join("\n");
      })
      .join("\n")
    : "- (none — all blips already have slice and ring assigned)";
  const adoptedClause = adoptedRing
    ? `\nNote: "${adoptedRing.name}" is a valid ring for foundational topics that
are fully established. A blip already in "${adoptedRing.name}" but missing a
slice should keep its ring and just have the slice filled in.`
    : "";

  return `I'm cleaning up the "${domainLabel}" tech radar — assigning slices and
rings to blips that are missing one or both. Use the existing topic
description, radar note (if any), and current placement to decide where
each belongs.

Domain description:
${descriptionBlock}

Within-scope description:
${withinScopeBlock}

Out-of-scope description:
${outOfScopeBlock}

The radar has these slices:
${quadrantList || "- (none defined)"}

And these rings (innermost first):
${ringList || "- (none defined)"}
${adoptedClause}

Blips that need a slice and/or ring assigned:
${blipList}

Please return ONLY a JSON array of entries assigning a slice and ring to
each blip above, using this exact shape (no other keys, no commentary):

[
  {
    "topic": "Topic name (must match exactly from the list above)",
    "action": "update",
    "radarNote": "Updated note explaining the placement. Use the literal string \\"no change\\" to keep the existing note as-is. Use null ONLY to ERASE the existing note (this will wipe it out).",
    "quadrant": "One of the slice names above (exact match)",
    "ring": "One of the ring names above (exact match)"
  }
]

Only include the topics from the list above. The "action" field must be
"update" so I overwrite their slice/ring placement. If a blip already has a
slice OR ring set (but not both), still include both in your response —
preserve the existing one unless you have a specific reason to change it.
`;
}

function valuesEqual(a: string | null, b: string | null): boolean {
  return (a ?? "") === (b ?? "");
}

function descriptionChanged(r: ResolvedLlmEntry): boolean {
  if (r.willCreateTopic) {
    return false;
  }
  return !valuesEqual(r.description, r.existingTopicDescription);
}

function radarNoteChanged(r: ResolvedLlmEntry): boolean {
  if (!r.existingBlipId) {
    return false;
  }
  return !valuesEqual(r.radarNote, r.existingRadarNote);
}

function quadrantChanged(r: ResolvedLlmEntry): boolean {
  if (!r.existingBlipId) {
    return false;
  }
  return r.quadrantId !== r.existingQuadrantId;
}

function ringChanged(r: ResolvedLlmEntry): boolean {
  if (!r.existingBlipId) {
    return false;
  }
  return r.ringId !== r.existingRingId;
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

  function defaultResolution(args: {
    isExcluded: boolean;
    llmAction: string | null;
    existingBlipId: string | null;
  }): Resolution {
    if (args.isExcluded) {
      return "skip";
    }
    if (args.llmAction === "remove" && args.existingBlipId) {
      return "removeBlip";
    }
    if (args.llmAction === "update" && args.existingBlipId) {
      return "overwriteAll";
    }
    if (args.llmAction === "add" && !args.existingBlipId) {
      return "create";
    }
    return args.existingBlipId ? "overwriteAll" : "create";
  }

  function parseAndResolve() {
    setParseError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFence(jsonText));
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
      const llmAction = typeof entry.action === "string"
        ? entry.action.trim().toLowerCase() || null
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

      // "no change" sentinel preserves the existing value. null in JSON
      // explicitly erases. Anything else is the new value.
      const llmDescription = typeof entry.description === "string"
        ? (isNoChangeSentinel(entry.description)
          ? topicMatch?.description ?? null
          : entry.description.trim() || null)
        : null;
      const llmRadarNote = typeof entry.radarNote === "string"
        ? (isNoChangeSentinel(entry.radarNote)
          ? existingBlip?.description ?? null
          : entry.radarNote.trim() || null)
        : null;

      const isExcluded = excludedNamesLower.has(topicName.toLowerCase());
      const resolution = defaultResolution({
        isExcluded,
        llmAction,
        existingBlipId: existingBlip?.id ?? null,
      });

      const partial = {
        topicName,
        quadrantInput,
        quadrantId: quadrantMatch?.id ?? null,
        ringInput,
        ringId: ringMatch?.id ?? null,
        resolution,
        existingBlipId: existingBlip?.id ?? null,
      };

      return {
        topicName,
        matchedTopicId: topicMatch?.id ?? null,
        willCreateTopic: !!topicName && !topicMatch,
        quadrantInput,
        ringInput,
        description: llmDescription,
        radarNote: llmRadarNote,
        quadrantId: quadrantMatch?.id ?? null,
        ringId: ringMatch?.id ?? null,
        existingBlipId: existingBlip?.id ?? null,
        existingQuadrantId: existingBlip?.quadrantId ?? null,
        existingRingId: existingBlip?.ringId ?? null,
        existingRadarNote: existingBlip?.description ?? null,
        existingTopicDescription: topicMatch?.description ?? null,
        topicCourseCount: topicMatch?.resourceCount ?? 0,
        topicTaskCount: topicMatch?.taskCount ?? 0,
        topicDailyCount: topicMatch?.dailyCount ?? 0,
        resolution,
        deleteTopicOnRemove: false,
        editing: false,
        editDraft: null,
        selected: false,
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
        const next: ResolvedLlmEntry = {
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

  function startEdit(idx: number) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) => {
        if (i !== idx) {
          return entry;
        }
        const draft: EditDraft = {
          description: entry.description ?? "",
          radarNote: entry.radarNote ?? "",
          quadrantId: entry.quadrantId ?? "",
          ringId: entry.ringId ?? "",
        };
        return {
          ...entry,
          editing: true,
          editDraft: draft,
        };
      });
    });
  }

  function commitEdit(idx: number) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) => {
        if (i !== idx || !entry.editDraft) {
          return entry;
        }
        const draft = entry.editDraft;
        const next: ResolvedLlmEntry = {
          ...entry,
          description: draft.description.trim() ? draft.description.trim() : null,
          radarNote: draft.radarNote.trim() ? draft.radarNote.trim() : null,
          quadrantId: draft.quadrantId || null,
          ringId: draft.ringId || null,
          editing: false,
          editDraft: null,
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function cancelEdit(idx: number) {
    updateEntry(idx, {
      editing: false,
      editDraft: null,
    });
  }

  function updateDraft(idx: number, patch: Partial<EditDraft>) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) => {
        if (i !== idx || !entry.editDraft) {
          return entry;
        }
        return {
          ...entry,
          editDraft: {
            ...entry.editDraft,
            ...patch,
          },
        };
      });
    });
  }

  function setRowSelected(idx: number, selected: boolean) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) =>
        i === idx
          ? {
            ...entry,
            selected,
          }
          : entry);
    });
  }

  function setAllSelected(selected: boolean) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map(entry => ({
        ...entry,
        selected,
      }));
    });
  }

  function bulkSetQuadrant(quadrantId: string) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      const match = quadrants.find(q => q.id === quadrantId);
      if (!match) {
        return prev;
      }
      return prev.map((entry) => {
        if (!entry.selected) {
          return entry;
        }
        if (entry.resolution === "skip" || entry.resolution === "removeBlip") {
          return entry;
        }
        const next: ResolvedLlmEntry = {
          ...entry,
          quadrantId: match.id,
          quadrantInput: match.name,
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function bulkSetRing(ringId: string) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      const match = rings.find(r => r.id === ringId);
      if (!match) {
        return prev;
      }
      return prev.map((entry) => {
        if (!entry.selected) {
          return entry;
        }
        if (entry.resolution === "skip" || entry.resolution === "removeBlip") {
          return entry;
        }
        const next: ResolvedLlmEntry = {
          ...entry,
          ringId: match.id,
          ringInput: match.name,
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function bulkSetResolution(resolution: Resolution) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry) => {
        if (!entry.selected) {
          return entry;
        }
        const conflicts = entry.existingBlipId !== null;
        // Skip is always valid; others depend on whether the row already has
        // an existing blip.
        if (resolution !== "skip") {
          if (resolution === "create" && conflicts) {
            return entry;
          }
          if (
            (resolution === "overwriteAll"
              || resolution === "updateBlip"
              || resolution === "removeBlip")
            && !conflicts
          ) {
            return entry;
          }
        }
        const next: ResolvedLlmEntry = {
          ...entry,
          resolution,
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function bulkClearDescriptions() {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map(entry =>
        entry.selected
          ? {
            ...entry,
            description: null,
          }
          : entry);
    });
  }

  function bulkClearRadarNotes() {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map(entry =>
        entry.selected
          ? {
            ...entry,
            radarNote: null,
          }
          : entry);
    });
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

  const counts = useMemo(() => {
    const c = {
      create: 0,
      overwriteAll: 0,
      updateBlip: 0,
      removeBlip: 0,
      skip: 0,
      problem: 0,
      newTopic: 0,
    };
    if (!resolved) {
      return c;
    }
    for (const r of resolved) {
      if (r.resolution === "skip") {
        c.skip += 1;
        continue;
      }
      if (r.problems.length > 0) {
        c.problem += 1;
        continue;
      }
      if (r.willCreateTopic && r.resolution === "create") {
        c.newTopic += 1;
      }
      c[r.resolution] += 1;
    }
    return c;
  }, [resolved]);

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

interface ReviewTableProps {
  resolved: ResolvedLlmEntry[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  quadrantById: Map<string, RadarQuadrant>;
  ringById: Map<string, RadarRing>;
  topicById: Map<string, TopicForTopicsPage>;
  updateEntry: (idx: number, patch: Partial<ResolvedLlmEntry>) => void;
  startEdit: (idx: number) => void;
  commitEdit: (idx: number) => void;
  cancelEdit: (idx: number) => void;
  updateDraft: (idx: number, patch: Partial<EditDraft>) => void;
  setRowSelected: (idx: number, selected: boolean) => void;
  setAllSelected: (selected: boolean) => void;
}

function ReviewTable({
  resolved,
  quadrants,
  rings,
  quadrantById,
  ringById,
  topicById,
  updateEntry,
  startEdit,
  commitEdit,
  cancelEdit,
  updateDraft,
  setRowSelected,
  setAllSelected,
}: ReviewTableProps) {
  const allSelected = resolved.length > 0 && resolved.every(r => r.selected);
  const someSelected = resolved.some(r => r.selected);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">
            <input
              type="checkbox"
              aria-label={allSelected ? "Deselect all" : "Select all"}
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = !allSelected && someSelected;
                }
              }}
              onChange={e => setAllSelected(e.target.checked)}
            />
          </TableHead>
          <TableHead className="min-w-32">Topic</TableHead>
          <TableHead className="min-w-56">Description</TableHead>
          <TableHead className="min-w-32">Slice</TableHead>
          <TableHead className="min-w-32">Ring</TableHead>
          <TableHead className="min-w-56">Radar Note</TableHead>
          <TableHead className="w-24">Edit</TableHead>
          <TableHead className="min-w-44">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resolved.map((r, idx) => (
          <ReviewRow
            key={idx}
            idx={idx}
            r={r}
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
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface ReviewRowProps {
  idx: number;
  r: ResolvedLlmEntry;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  quadrantById: Map<string, RadarQuadrant>;
  ringById: Map<string, RadarRing>;
  topicById: Map<string, TopicForTopicsPage>;
  updateEntry: (idx: number, patch: Partial<ResolvedLlmEntry>) => void;
  startEdit: (idx: number) => void;
  commitEdit: (idx: number) => void;
  cancelEdit: (idx: number) => void;
  updateDraft: (idx: number, patch: Partial<EditDraft>) => void;
  setRowSelected: (idx: number, selected: boolean) => void;
}

function ReviewRow({
  idx,
  r,
  quadrants,
  rings,
  quadrantById,
  ringById,
  topicById,
  updateEntry,
  startEdit,
  commitEdit,
  cancelEdit,
  updateDraft,
  setRowSelected,
}: ReviewRowProps) {
  const isSkipped = r.resolution === "skip";
  const isRemove = r.resolution === "removeBlip";
  const hasProblems = r.problems.length > 0;
  const conflicts = r.existingBlipId !== null;

  const rowTone = isSkipped
    ? "opacity-60"
    : hasProblems
      ? "bg-destructive/10"
      : isRemove
        ? "bg-red-50/40"
        : conflicts
          ? "bg-amber-50/40"
          : "";

  // Description is unaffected by removal — when removing, only the blip goes
  // away, not the topic by default.
  const descCellEditable = !isSkipped;
  const noteCellEditable = !isSkipped && !isRemove;
  const placementCellEditable = !isSkipped && !isRemove;

  const showDescDiff = descriptionChanged(r);
  const showNoteDiff = radarNoteChanged(r);
  const showQuadrantDiff = quadrantChanged(r);
  const showRingDiff = ringChanged(r);

  const existingQuadrantName = r.existingQuadrantId
    ? quadrantById.get(r.existingQuadrantId)?.name ?? "?"
    : null;
  const existingRingName = r.existingRingId
    ? ringById.get(r.existingRingId)?.name ?? "?"
    : null;
  const newQuadrantName = r.quadrantId
    ? quadrantById.get(r.quadrantId)?.name ?? r.quadrantInput
    : r.quadrantInput;
  const newRingName = r.ringId
    ? ringById.get(r.ringId)?.name ?? r.ringInput
    : r.ringInput;

  const canDeleteTopic
    = isRemove
      && r.matchedTopicId !== null
      && r.topicCourseCount === 0
      && r.topicTaskCount === 0
      && r.topicDailyCount === 0;
  const topic = r.matchedTopicId ? topicById.get(r.matchedTopicId) : null;

  return (
    <TableRow className={rowTone}>
      <TableCell className="align-top">
        <input
          type="checkbox"
          aria-label={r.selected ? "Deselect row" : "Select row"}
          checked={r.selected}
          onChange={e => setRowSelected(idx, e.target.checked)}
        />
      </TableCell>
      <TableCell className="align-top">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{r.topicName || "(no topic)"}</span>
          <div className="flex flex-row flex-wrap gap-1">
            {r.willCreateTopic && (
              <span
                className={`
                  rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[10px]
                  text-emerald-800
                `}
              >
                New topic
              </span>
            )}
            {!r.willCreateTopic && r.matchedTopicId && (
              <span
                className={`
                  rounded-sm bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-800
                `}
              >
                Existing topic
              </span>
            )}
            {conflicts && (
              <span
                className={`
                  rounded-sm bg-amber-200 px-1.5 py-0.5 text-[10px]
                  text-amber-900
                `}
              >
                On radar
              </span>
            )}
          </div>
          {hasProblems && !isSkipped && (
            <span className="text-[11px] text-destructive">
              {r.problems.join("; ")}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="align-top">
        <DiffCell
          existingValue={r.willCreateTopic ? null : r.existingTopicDescription}
          newValue={r.description}
          showDiff={showDescDiff}
          editing={r.editing && descCellEditable}
          draftValue={r.editDraft?.description ?? ""}
          onDraftChange={value => updateDraft(idx, {
            description: value,
          })}
          multiline
        />
      </TableCell>

      <TableCell className="align-top">
        {isRemove
          ? <span className="text-xs text-muted-foreground">—</span>
          : (
            <PlacementCell
              existingName={existingQuadrantName}
              newName={newQuadrantName}
              showDiff={showQuadrantDiff}
              editing={r.editing && placementCellEditable}
              draftId={r.editDraft?.quadrantId ?? ""}
              options={quadrants}
              onDraftChange={value => updateDraft(idx, {
                quadrantId: value,
              })}
            />
          )}
      </TableCell>

      <TableCell className="align-top">
        {isRemove
          ? <span className="text-xs text-muted-foreground">—</span>
          : (
            <PlacementCell
              existingName={existingRingName}
              newName={newRingName}
              showDiff={showRingDiff}
              editing={r.editing && placementCellEditable}
              draftId={r.editDraft?.ringId ?? ""}
              options={rings}
              onDraftChange={value => updateDraft(idx, {
                ringId: value,
              })}
            />
          )}
      </TableCell>

      <TableCell className="align-top">
        <DiffCell
          existingValue={r.existingRadarNote}
          newValue={r.radarNote}
          showDiff={showNoteDiff}
          editing={r.editing && noteCellEditable}
          draftValue={r.editDraft?.radarNote ?? ""}
          onDraftChange={value => updateDraft(idx, {
            radarNote: value,
          })}
          multiline
        />
      </TableCell>

      <TableCell className="align-top">
        {!r.editing
          ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => startEdit(idx)}
              disabled={isSkipped}
              aria-label="Edit"
            >
              <PencilIcon />
            </Button>
          )
          : (
            <div className="flex flex-row gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => commitEdit(idx)}
                aria-label="Commit edit"
              >
                <CheckIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => cancelEdit(idx)}
                aria-label="Discard edit"
              >
                <XIcon />
              </Button>
            </div>
          )}
      </TableCell>

      <TableCell className="align-top">
        <div className="flex flex-col gap-1">
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
                    <SelectItem value="overwriteAll">Overwrite All</SelectItem>
                    <SelectItem value="updateBlip">Update Blip</SelectItem>
                    <SelectItem value="removeBlip">Remove Blip</SelectItem>
                    <SelectItem value="skip">Skip</SelectItem>
                  </>
                )
                : (
                  <>
                    <SelectItem value="create">Add Blip</SelectItem>
                    <SelectItem value="skip">Skip</SelectItem>
                  </>
                )}
            </SelectContent>
          </Select>
          {isRemove && r.matchedTopicId && (
            <label
              className={`
                flex flex-row items-center gap-1 text-[11px]
                ${canDeleteTopic ? "" : "text-muted-foreground"}
              `}
              title={
                canDeleteTopic
                  ? undefined
                  : `Topic has ${r.topicCourseCount} course(s), ${r.topicTaskCount} task(s), ${r.topicDailyCount} daily/dailies — keep`
              }
            >
              <input
                type="checkbox"
                checked={r.deleteTopicOnRemove}
                disabled={!canDeleteTopic}
                onChange={e => updateEntry(idx, {
                  deleteTopicOnRemove: e.target.checked,
                })}
              />
              Also delete topic
              {!canDeleteTopic && topic && (
                <span className="text-[10px]">
                  {" "}
                  (in use)
                </span>
              )}
            </label>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

interface DiffCellProps {
  existingValue: string | null;
  newValue: string | null;
  showDiff: boolean;
  editing: boolean;
  draftValue: string;
  onDraftChange: (value: string) => void;
  multiline?: boolean;
}

function DiffCell({
  existingValue,
  newValue,
  showDiff,
  editing,
  draftValue,
  onDraftChange,
  multiline,
}: DiffCellProps) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      {showDiff && (
        <span className="text-muted-foreground/70 italic line-through">
          {existingValue || "(none)"}
        </span>
      )}
      <span>
        {newValue || (
          <span className="text-muted-foreground italic">(none)</span>
        )}
      </span>
      {editing && (
        multiline
          ? (
            <Textarea
              value={draftValue}
              onChange={e => onDraftChange(e.target.value)}
              className="mt-1 min-h-16 text-xs"
            />
          )
          : (
            <Input
              value={draftValue}
              onChange={e => onDraftChange(e.target.value)}
              className="mt-1"
            />
          )
      )}
    </div>
  );
}

interface PlacementCellProps {
  existingName: string | null;
  newName: string | null;
  showDiff: boolean;
  editing: boolean;
  draftId: string;
  options: { id: string;
    name: string; }[];
  onDraftChange: (value: string) => void;
}

function PlacementCell({
  existingName,
  newName,
  showDiff,
  editing,
  draftId,
  options,
  onDraftChange,
}: PlacementCellProps) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      {showDiff
        ? (
          <span className="flex flex-row items-center gap-1">
            <span className="text-muted-foreground/70 line-through">
              {existingName ?? "(none)"}
            </span>
            <span aria-hidden>→</span>
            <span>{newName || "(none)"}</span>
          </span>
        )
        : (
          <span>
            {newName || (
              <span className="text-muted-foreground italic">(none)</span>
            )}
          </span>
        )}
      {editing && (
        <Select
          value={draftId}
          onValueChange={onDraftChange}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {options.map(o => (
              <SelectItem
                key={o.id}
                value={o.id}
              >{o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

interface BulkEditBarProps {
  resolved: ResolvedLlmEntry[];
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  onBulkQuadrant: (quadrantId: string) => void;
  onBulkRing: (ringId: string) => void;
  onBulkResolution: (resolution: Resolution) => void;
  onClearDescriptions: () => void;
  onClearRadarNotes: () => void;
}

function BulkEditBar({
  resolved,
  quadrants,
  rings,
  onBulkQuadrant,
  onBulkRing,
  onBulkResolution,
  onClearDescriptions,
  onClearRadarNotes,
}: BulkEditBarProps) {
  const [pendingQuadrant, setPendingQuadrant] = useState<string>("");
  const [pendingRing, setPendingRing] = useState<string>("");
  const [pendingResolution, setPendingResolution] = useState<string>("");

  const selectedCount = resolved.filter(r => r.selected).length;
  const anySelected = selectedCount > 0;

  function applyQuadrant() {
    if (!pendingQuadrant) {
      return;
    }
    onBulkQuadrant(pendingQuadrant);
    setPendingQuadrant("");
  }

  function applyRing() {
    if (!pendingRing) {
      return;
    }
    onBulkRing(pendingRing);
    setPendingRing("");
  }

  function applyResolution() {
    if (!pendingResolution) {
      return;
    }
    onBulkResolution(pendingResolution as Resolution);
    setPendingResolution("");
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-sm border bg-muted/30 p-2 text-sm"
    >
      <span className="font-medium">
        Bulk edit (
        {selectedCount}
        {" "}
        selected)
      </span>
      <div className="flex flex-row flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Slice</span>
          <div className="flex flex-row gap-1">
            <Select
              value={pendingQuadrant}
              onValueChange={setPendingQuadrant}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Pick slice" />
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyQuadrant}
              disabled={!anySelected || !pendingQuadrant}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Ring</span>
          <div className="flex flex-row gap-1">
            <Select
              value={pendingRing}
              onValueChange={setPendingRing}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Pick ring" />
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
              variant="outline"
              size="sm"
              onClick={applyRing}
              disabled={!anySelected || !pendingRing}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Action</span>
          <div className="flex flex-row gap-1">
            <Select
              value={pendingResolution}
              onValueChange={setPendingResolution}
            >
              <SelectTrigger className="h-8 w-44">
                <SelectValue placeholder="Pick action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">Add Blip</SelectItem>
                <SelectItem value="overwriteAll">Overwrite All</SelectItem>
                <SelectItem value="updateBlip">Update Blip</SelectItem>
                <SelectItem value="removeBlip">Remove Blip</SelectItem>
                <SelectItem value="skip">Skip</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyResolution}
              disabled={!anySelected || !pendingResolution}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearDescriptions}
            disabled={!anySelected}
          >
            Clear descriptions
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearRadarNotes}
            disabled={!anySelected}
          >
            Clear radar notes
          </Button>
        </div>
      </div>
    </div>
  );
}
