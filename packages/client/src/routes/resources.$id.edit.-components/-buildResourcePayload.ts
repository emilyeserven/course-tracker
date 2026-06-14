import type { EntityStatus, ResourceType } from "@emstack/types";

import * as z from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.enum(["website", "book"]),
  description: z.string().max(500),
  url: z.string().max(255),
  status: z.enum(["active", "inactive", "complete"]),
  progressCurrent: z.number().int().min(0).nullable(),
  progressTotal: z.number().int().min(0).nullable(),
  cost: z.number().min(0).nullable(),
  dateExpires: z.date().nullable(),
  topicId: z.string(),
  courseProviderId: z.string(),
  providerIsSelf: z.boolean(),
  modulesAreExhaustive: z.boolean(),
  easeOfStarting: z.enum(["", "low", "medium", "high"]),
  timeNeeded: z.enum(["", "low", "medium", "high"]),
  interactivity: z.enum(["", "low", "medium", "high"]),
  tagIds: z.array(z.string()),
});

// Mirrors the edit form's value type. It is intentionally looser than
// `z.infer<typeof formSchema>`: TanStack Form derives the value type from the
// default values (seeded from the fetched resource), so `status` is the full
// `EntityStatus` and the level fields widen to `string`. The narrow schema enum
// above is only the submit-time validator. Declared explicitly so the helper
// stays decoupled from the form and is straightforward to unit test.
export interface ResourceFormValues {
  name: string;
  type: ResourceType;
  description: string;
  url: string;
  status: EntityStatus;
  progressCurrent: number | null;
  progressTotal: number | null;
  cost: number | null;
  dateExpires: Date | null;
  topicId: string;
  courseProviderId: string;
  providerIsSelf: boolean;
  modulesAreExhaustive: boolean;
  easeOfStarting: string;
  timeNeeded: string;
  interactivity: string;
  tagIds: string[];
}

/**
 * Assemble the resource upsert payload from the edit form's values. Kept as a
 * pure function so the per-field `|| null` / `?? 0` coalescing and the
 * cost/expiry branching live in one testable place instead of inflating the
 * form's `onSubmit` handler. The return shape stays an inferred object literal
 * so it remains assignable to the `Record<string, unknown>` that the entity
 * client's `upsert` expects.
 *
 * `isCostFromPlatform` is passed in (not derived here) because it depends on the
 * selected provider, which only the form component knows.
 *
 * Its cyclomatic score is an artifact of the per-field `|| null` / `?? 0`
 * coalescing, not branching logic (same as `startingValues`), so it reads
 * clearer kept whole.
 */
// fallow-ignore-next-line complexity
export function buildResourcePayload(
  value: ResourceFormValues,
  {
    isCostFromPlatform,
  }: {
    isCostFromPlatform: boolean;
  },
) {
  return {
    name: value.name,
    type: value.type,
    description: value.description || null,
    url: value.url || null,
    status: value.status,
    progressCurrent: value.progressCurrent ?? 0,
    progressTotal: value.progressTotal ?? 0,
    cost: isCostFromPlatform
      ? null
      : value.cost != null
        ? String(value.cost)
        : null,
    isCostFromPlatform,
    dateExpires: value.dateExpires
      ? value.dateExpires.toISOString().split("T")[0]
      : null,
    isExpires: !!value.dateExpires,
    topicId: value.topicId || null,
    courseProviderId: value.courseProviderId || null,
    providerIsSelf: value.providerIsSelf,
    modulesAreExhaustive: value.modulesAreExhaustive,
    easeOfStarting: value.easeOfStarting || null,
    timeNeeded: value.timeNeeded || null,
    interactivity: value.interactivity || null,
    tagIds: value.tagIds,
  };
}
