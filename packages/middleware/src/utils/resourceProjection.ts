// Sibling utils are imported relatively (not via the `@/` alias) so the Node
// test runner can load this module directly — see the middleware CLAUDE.md.
import { processCost } from "./processCost.ts";
import { toProviderBlock } from "./providerProjection.ts";
import type {
  CostData,
  Resource,
  Tag,
} from "@emstack/types";

// The fields mapResource reads. Both resource queries produce a superset of
// this shape, so their (wider) Drizzle result rows are assignable here. The
// list query omits dailies.location/description; they are optional here and
// serialize away when undefined, so the list response is unchanged.
interface ResourceProjectionRow {
  id: string;
  name: string;
  type: Resource["type"] | null;
  description: string | null;
  url: string | null;
  dateExpires: string | null;
  progressCurrent: number | null;
  progressTotal: number | null;
  status: Resource["status"] | null;
  providerIsSelf: boolean | null;
  modulesAreExhaustive: boolean | null;
  tracksProgress: boolean | null;
  easeOfStarting: Resource["easeOfStarting"];
  timeNeeded: Resource["timeNeeded"];
  interactivity: Resource["interactivity"];
  cost: string | null;
  modulesConfig: Resource["modulesConfig"];
  courseProvider: { id: string;
    name: string | null;
    cost: string | null;
    isCourseFeesShared: boolean | null;
    resources: unknown[]; } | null;
  resourceTags: { tag: Tag }[];
}

export function mapResource(resource: ResourceProjectionRow): Resource {
  const cost: CostData = processCost(resource);
  return {
    id: resource.id,
    name: resource.name,
    type: resource.type ?? "website",
    description: resource.description,
    url: resource.url,
    cost,
    dateExpires: resource.dateExpires,
    progressCurrent: resource.progressCurrent ? resource.progressCurrent : 0,
    progressTotal: resource.progressTotal ? resource.progressTotal : 0,
    status: resource.status ?? "inactive",
    providerIsSelf: resource.providerIsSelf ?? false,
    modulesAreExhaustive: resource.modulesAreExhaustive ?? false,
    tracksProgress: resource.tracksProgress ?? true,
    provider: toProviderBlock(resource.courseProvider),
    easeOfStarting: resource.easeOfStarting ?? null,
    timeNeeded: resource.timeNeeded ?? null,
    interactivity: resource.interactivity ?? null,
    tags: (resource.resourceTags ?? []).map(j => j.tag),
    modulesConfig: resource.modulesConfig ?? null,
  };
}
