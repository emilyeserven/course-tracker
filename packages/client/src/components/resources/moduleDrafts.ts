import type {
  Module,
  ModuleDurationBucket,
  ModuleGroup,
  ParsedModuleLength,
  Tag,
  TagGroup,
  TaskResourceLevel,
} from "@emstack/types";

import { parseModuleLength } from "@emstack/types";

export interface GroupDraft {
  id: string;
  name: string;
  description: string;
  url: string;
  totalCount: string;
  completedCount: string;
  easeOfStarting: TaskResourceLevel | "";
  timeNeeded: TaskResourceLevel | "";
  interactivity: TaskResourceLevel | "";
  tagIds: string[];
}

export type DurationMode = "minutes" | "bucket";

export interface ModuleDraft {
  id: string;
  name: string;
  description: string;
  url: string;
  durationMode: DurationMode;
  minutesValue: string;
  bucketValue: ModuleDurationBucket | "";
  easeOfStarting: TaskResourceLevel | "";
  timeNeeded: TaskResourceLevel | "";
  interactivity: TaskResourceLevel | "";
  tagIds: string[];
}

export const NEW_ID = "__new__";

export function emptyGroupDraft(): GroupDraft {
  return {
    id: NEW_ID,
    name: "",
    description: "",
    url: "",
    totalCount: "",
    completedCount: "",
    easeOfStarting: "",
    timeNeeded: "",
    interactivity: "",
    tagIds: [],
  };
}

export function groupToDraft(g: ModuleGroup): GroupDraft {
  return {
    id: g.id,
    name: g.name,
    description: g.description ?? "",
    url: g.url ?? "",
    totalCount: g.totalCount != null ? String(g.totalCount) : "",
    completedCount: g.completedCount != null ? String(g.completedCount) : "",
    easeOfStarting: g.easeOfStarting ?? "",
    timeNeeded: g.timeNeeded ?? "",
    interactivity: g.interactivity ?? "",
    tagIds: (g.tags ?? []).map(t => t.id),
  };
}

export function emptyModuleDraft(): ModuleDraft {
  return {
    id: NEW_ID,
    name: "",
    description: "",
    url: "",
    durationMode: "minutes",
    minutesValue: "",
    bucketValue: "",
    easeOfStarting: "",
    timeNeeded: "",
    interactivity: "",
    tagIds: [],
  };
}

export function moduleToDraft(m: Module): ModuleDraft {
  const parsed: ParsedModuleLength = parseModuleLength(m.length);
  const base = {
    id: m.id,
    name: m.name,
    description: m.description ?? "",
    url: m.url ?? "",
    easeOfStarting: m.easeOfStarting ?? ("" as const),
    timeNeeded: m.timeNeeded ?? ("" as const),
    interactivity: m.interactivity ?? ("" as const),
    tagIds: (m.tags ?? []).map(t => t.id),
  };
  if (parsed?.kind === "bucket") {
    return {
      ...base,
      durationMode: "bucket",
      minutesValue: "",
      bucketValue: parsed.bucket,
    };
  }
  if (parsed?.kind === "minutes") {
    return {
      ...base,
      durationMode: "minutes",
      minutesValue: String(parsed.minutes),
      bucketValue: "",
    };
  }
  return {
    ...base,
    durationMode: "minutes",
    minutesValue: "",
    bucketValue: "",
  };
}

export function draftToLength(d: ModuleDraft): string | null {
  if (d.durationMode === "minutes") {
    return d.minutesValue ? d.minutesValue : null;
  }
  return d.bucketValue || null;
}

export function levelChipClass(level: TaskResourceLevel | null | undefined): string {
  switch (level) {
    case "low":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200";
    case "high":
      return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200";
    default:
      return "bg-muted text-muted-foreground border-muted-foreground/30";
  }
}

export function lookupTagsByIds(ids: string[], tagGroups: TagGroup[]): Tag[] {
  const byId = new Map<string, Tag>();
  for (const group of tagGroups) {
    for (const tag of group.tags ?? []) {
      byId.set(tag.id, tag);
    }
  }
  return ids.map(id => byId.get(id)).filter((t): t is Tag => t !== undefined);
}

export function parseCount(s: string): number | null {
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}
