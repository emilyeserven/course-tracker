import type {
  DomainExcludedTopic,
  DomainTopic,
  RadarQuadrant,
  RadarRing,
} from "@emstack/types";

export type PromptMode = "setup" | "cleanup";

export interface BuildPromptArgs {
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

export interface BuildCleanupPromptArgs {
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

export function describeProgress(course: {
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

export function formatTopicsWithCourses(domainTopics: DomainTopic[]): string {
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

export function formatExcludedTopics(excluded: DomainExcludedTopic[]): string {
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

export function formatTopicNameList(names: string[] | undefined): string {
  if (!names || names.length === 0) {
    return "- (none)";
  }
  return names.map(n => `- ${n}`).join("\n");
}

/**
 * The quadrant/ring/domain/scope prose blocks shared by the setup and cleanup
 * prompt builders, derived from the fields both arg shapes have in common.
 */
function buildSharedPromptParts(args: {
  domainTitle: string;
  domainDescription?: string | null;
  withinScopeDescription?: string | null;
  outOfScopeDescription?: string | null;
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
}) {
  const {
    domainTitle,
    domainDescription,
    withinScopeDescription,
    outOfScopeDescription,
    quadrants,
    rings,
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

  return {
    adoptedRing,
    quadrantList,
    ringList,
    domainLabel,
    descriptionBlock,
    withinScopeBlock,
    outOfScopeBlock,
  };
}

export function buildLlmPrompt(args: BuildPromptArgs): string {
  const {
    domainTopics,
    excludedTopics,
    withinScopeTopicNames,
    outOfScopeTopicNames,
    existingBlips,
  } = args;

  const {
    adoptedRing,
    quadrantList,
    ringList,
    domainLabel,
    descriptionBlock,
    withinScopeBlock,
    outOfScopeBlock,
  } = buildSharedPromptParts(args);
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

export function buildCleanupPrompt(args: BuildCleanupPromptArgs): string {
  const {
    unassignedBlips,
  } = args;

  const {
    adoptedRing,
    quadrantList,
    ringList,
    domainLabel,
    descriptionBlock,
    withinScopeBlock,
    outOfScopeBlock,
  } = buildSharedPromptParts(args);

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
