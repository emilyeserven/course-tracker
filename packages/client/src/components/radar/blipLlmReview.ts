import type {
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

import { stripCodeFence } from "@/utils";

export type Resolution
  = | "create"
    | "overwriteAll"
    | "updateBlip"
    | "removeBlip"
    | "skip";

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

export interface EditDraft {
  description: string;
  radarNote: string;
  quadrantId: string;
  ringId: string;
}

export interface ResolvedLlmEntry {
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

export function computeProblems(
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

function valuesEqual(a: string | null, b: string | null): boolean {
  return (a ?? "") === (b ?? "");
}

export function descriptionChanged(r: ResolvedLlmEntry): boolean {
  if (r.willCreateTopic) {
    return false;
  }
  return !valuesEqual(r.description, r.existingTopicDescription);
}

export function radarNoteChanged(r: ResolvedLlmEntry): boolean {
  if (!r.existingBlipId) {
    return false;
  }
  return !valuesEqual(r.radarNote, r.existingRadarNote);
}

export function quadrantChanged(r: ResolvedLlmEntry): boolean {
  if (!r.existingBlipId) {
    return false;
  }
  return r.quadrantId !== r.existingQuadrantId;
}

export function ringChanged(r: ResolvedLlmEntry): boolean {
  if (!r.existingBlipId) {
    return false;
  }
  return r.ringId !== r.existingRingId;
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

export interface ParseLlmLookups {
  topicByLowerName: Map<string, TopicForTopicsPage>;
  quadrantByLowerName: Map<string, RadarQuadrant>;
  ringByLowerName: Map<string, RadarRing>;
  existingBlipByTopicId: Map<string, RadarBlip>;
  excludedNamesLower: Set<string>;
}

export type ParseLlmEntriesResult
  = | { entries: ResolvedLlmEntry[];
    error: null; }
    | { entries: null;
      error: string; };

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAction(value: unknown): string | null {
  return typeof value === "string"
    ? value.trim().toLowerCase() || null
    : null;
}

function lookupByLowerName<T>(
  map: Map<string, T>,
  name: string,
): T | undefined {
  return name ? map.get(name.toLowerCase()) : undefined;
}

// "no change" sentinel preserves the existing value. null in JSON
// explicitly erases. Anything else is the new value.
function resolveTextField(
  value: unknown,
  noChangeFallback: string | null,
): string | null {
  if (typeof value !== "string") {
    return null;
  }
  if (isNoChangeSentinel(value)) {
    return noChangeFallback;
  }
  return value.trim() || null;
}

function existingBlipState(blip: RadarBlip | null) {
  return blip
    ? {
      existingBlipId: blip.id,
      existingQuadrantId: blip.quadrantId,
      existingRingId: blip.ringId,
      existingRadarNote: blip.description ?? null,
    }
    : {
      existingBlipId: null,
      existingQuadrantId: null,
      existingRingId: null,
      existingRadarNote: null,
    };
}

function matchedTopicState(topic: TopicForTopicsPage | undefined) {
  return topic
    ? {
      matchedTopicId: topic.id,
      existingTopicDescription: topic.description ?? null,
      topicCourseCount: topic.resourceCount ?? 0,
      topicTaskCount: topic.taskCount ?? 0,
      topicDailyCount: topic.dailyCount ?? 0,
    }
    : {
      matchedTopicId: null,
      existingTopicDescription: null,
      topicCourseCount: 0,
      topicTaskCount: 0,
      topicDailyCount: 0,
    };
}

function resolveLlmEntry(
  entry: LlmEntry,
  lookups: ParseLlmLookups,
): ResolvedLlmEntry {
  const {
    topicByLowerName,
    quadrantByLowerName,
    ringByLowerName,
    existingBlipByTopicId,
    excludedNamesLower,
  } = lookups;

  const topicName = asTrimmedString(entry.topic);
  const quadrantInput = asTrimmedString(entry.quadrant);
  const ringInput = asTrimmedString(entry.ring);
  const llmAction = normalizeAction(entry.action);

  const quadrantMatch = lookupByLowerName(quadrantByLowerName, quadrantInput);
  const ringMatch = lookupByLowerName(ringByLowerName, ringInput);
  const topicMatch = lookupByLowerName(topicByLowerName, topicName);
  const existingBlip = topicMatch
    ? existingBlipByTopicId.get(topicMatch.id) ?? null
    : null;

  const blipState = existingBlipState(existingBlip);
  const topicState = matchedTopicState(topicMatch);
  const quadrantId = quadrantMatch ? quadrantMatch.id : null;
  const ringId = ringMatch ? ringMatch.id : null;

  const llmDescription = resolveTextField(
    entry.description,
    topicState.existingTopicDescription,
  );
  const llmRadarNote = resolveTextField(
    entry.radarNote,
    blipState.existingRadarNote,
  );

  const isExcluded = excludedNamesLower.has(topicName.toLowerCase());
  const resolution = defaultResolution({
    isExcluded,
    llmAction,
    existingBlipId: blipState.existingBlipId,
  });

  const partial = {
    topicName,
    quadrantInput,
    quadrantId,
    ringInput,
    ringId,
    resolution,
    existingBlipId: blipState.existingBlipId,
  };

  return {
    topicName,
    willCreateTopic: !!topicName && !topicMatch,
    quadrantInput,
    ringInput,
    description: llmDescription,
    radarNote: llmRadarNote,
    quadrantId,
    ringId,
    ...blipState,
    ...topicState,
    resolution,
    deleteTopicOnRemove: false,
    editing: false,
    editDraft: null,
    selected: false,
    problems: computeProblems(partial, excludedNamesLower),
  };
}

export function parseLlmEntries(
  jsonText: string,
  lookups: ParseLlmLookups,
): ParseLlmEntriesResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(jsonText));
  }
  catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    return {
      entries: null,
      error: message,
    };
  }
  if (!Array.isArray(parsed)) {
    return {
      entries: null,
      error: "Expected a JSON array.",
    };
  }

  const entries = parsed as LlmEntry[];
  return {
    entries: entries.map(entry => resolveLlmEntry(entry, lookups)),
    error: null,
  };
}
