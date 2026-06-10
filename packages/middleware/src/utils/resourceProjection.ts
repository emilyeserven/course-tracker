import { processCost } from "@/utils/processCost";
import { processResourceLinks } from "@/utils/processResourceLinks";
import type {
  CostData,
  Resource,
  ResourceFromServer,
  Tag,
  TopicsToResources,
} from "@emstack/types";

// The fields mapResource reads. Both resource queries produce a superset of
// this shape, so their (wider) Drizzle result rows are assignable here. The
// list query omits dailies.location/description; they are optional here and
// serialize away when undefined, so the list response is unchanged.
interface ResourceProjectionRow {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  dateExpires: string | null;
  progressCurrent: number | null;
  progressTotal: number | null;
  status: Resource["status"] | null;
  easeOfStarting: Resource["easeOfStarting"];
  timeNeeded: Resource["timeNeeded"];
  interactivity: Resource["interactivity"];
  courseProvider: { id: string;
    name: string | null; } | null;
  topicsToResources: TopicsToResources[];
  resourceTags: { tag: Tag }[];
}

export function mapResource(course: ResourceProjectionRow): Resource {
  const cost: CostData = processCost(course as unknown as ResourceFromServer);
  return {
    id: course.id,
    name: course.name,
    description: course.description,
    url: course.url,
    cost,
    dateExpires: course.dateExpires,
    progressCurrent: course.progressCurrent ? course.progressCurrent : 0,
    progressTotal: course.progressTotal ? course.progressTotal : 0,
    status: course.status ?? "inactive",
    topics: processResourceLinks(course.topicsToResources, "topic"),
    provider:
      course.courseProvider?.name && course.courseProvider?.id
        ? {
          name: course.courseProvider.name,
          id: course.courseProvider.id,
        }
        : undefined,
    easeOfStarting: course.easeOfStarting ?? null,
    timeNeeded: course.timeNeeded ?? null,
    interactivity: course.interactivity ?? null,
    tags: (course.resourceTags ?? []).map(j => j.tag),
  };
}
