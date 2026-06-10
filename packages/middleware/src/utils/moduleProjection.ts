import type {
  Module,
  ModuleGroup,
  Tag,
  TaskResourceLevel,
} from "@emstack/types";

// The fields mapModule reads. The single-module and list module queries both
// produce a superset of this shape, so their Drizzle rows are assignable here.
interface ModuleProjectionRow {
  id: string;
  resourceId: string;
  moduleGroupId: string | null;
  name: string;
  description: string | null;
  url: string | null;
  length: string | null;
  minutesLength: number | null;
  isComplete: boolean;
  position: number | null;
  easeOfStarting: TaskResourceLevel | null;
  timeNeeded: TaskResourceLevel | null;
  interactivity: TaskResourceLevel | null;
  moduleTags: { tag: Tag }[];
}

export function mapModule(m: ModuleProjectionRow): Module {
  return {
    id: m.id,
    resourceId: m.resourceId,
    moduleGroupId: m.moduleGroupId,
    name: m.name,
    description: m.description,
    url: m.url,
    length: m.length,
    minutesLength: m.minutesLength,
    isComplete: m.isComplete,
    position: m.position,
    easeOfStarting: m.easeOfStarting ?? null,
    timeNeeded: m.timeNeeded ?? null,
    interactivity: m.interactivity ?? null,
    tags: (m.moduleTags ?? []).map(j => j.tag),
  };
}

// The fields mapModuleGroup reads.
interface ModuleGroupProjectionRow {
  id: string;
  resourceId: string;
  name: string;
  description: string | null;
  url: string | null;
  position: number | null;
  totalCount: number | null;
  completedCount: number | null;
  modules: ModuleGroup["modules"];
  easeOfStarting: TaskResourceLevel | null;
  timeNeeded: TaskResourceLevel | null;
  interactivity: TaskResourceLevel | null;
  moduleGroupTags: { tag: Tag }[];
}

export function mapModuleGroup(g: ModuleGroupProjectionRow): ModuleGroup {
  return {
    id: g.id,
    resourceId: g.resourceId,
    name: g.name,
    description: g.description,
    url: g.url,
    position: g.position,
    totalCount: g.totalCount,
    completedCount: g.completedCount,
    modules: g.modules,
    easeOfStarting: g.easeOfStarting ?? null,
    timeNeeded: g.timeNeeded ?? null,
    interactivity: g.interactivity ?? null,
    tags: (g.moduleGroupTags ?? []).map(j => j.tag),
  };
}
