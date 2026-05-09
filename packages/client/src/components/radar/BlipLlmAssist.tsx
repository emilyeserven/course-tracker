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

import { Input } from "@/components/forms/input";
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
            : "  - general description: (missing — supply one in your output if you keep this blip)",
        );
        lines.push(`  - radar note: ${note || "(none)"}`);
        return lines.join("\n");
      })
      .join("\n")
    : "- (none yet)";

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
    "action": "add | update | remove (optional — see below)",
    "description": "A short factual description of what the topic IS — saved as the topic's description if the topic is new, or if the topic exists but has no description yet (marked missing above). Null only when the topic already has a description and you have nothing to add.",
    "radarNote": "A short note explaining WHY this topic belongs on the radar in this slice/ring. Keep high-level framing to a minimum; prefer specific, concrete references — which courses, projects, prior placements, or trade-offs drive the choice — over generic justifications. Null if no note.",
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
  const prompt = useMemo(
    () => {
      const topicById = new Map(topics.map(t => [t.id, t]));
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
      const llmDescription = typeof entry.description === "string"
        ? entry.description.trim() || null
        : null;
      const llmRadarNote = typeof entry.radarNote === "string"
        ? entry.radarNote.trim() || null
        : null;
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
        topicCourseCount: topicMatch?.courseCount ?? 0,
        topicTaskCount: topicMatch?.taskCount ?? 0,
        topicDailyCount: topicMatch?.dailyCount ?? 0,
        resolution,
        deleteTopicOnRemove: false,
        editing: false,
        editDraft: null,
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
}: ReviewTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
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
