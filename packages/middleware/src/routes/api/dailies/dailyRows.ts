import {
  completionSchema,
  criteriaSchema,
  nullableDailyStatusEnum,
  nullableString,
} from "../../../utils/schemas.ts";

import type { DailyCompletion, DailyCriteria } from "@emstack/types";

// Body schema and row builder shared by the daily create and upsert handlers.

export interface DailyBody {
  name: string;
  location?: string | null;
  description?: string | null;
  completions?: DailyCompletion[];
  courseProviderId?: string | null;
  resourceId?: string | null;
  moduleGroupId?: string | null;
  moduleId?: string | null;
  taskId?: string | null;
  status?: "active" | "inactive" | "complete" | "paused" | null;
  criteria?: DailyCriteria;
}

export const dailyBodySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: {
      type: "string",
    },
    location: nullableString,
    description: nullableString,
    completions: {
      type: "array",
      items: completionSchema,
    },
    courseProviderId: nullableString,
    resourceId: nullableString,
    moduleGroupId: nullableString,
    moduleId: nullableString,
    taskId: nullableString,
    status: nullableDailyStatusEnum,
    criteria: criteriaSchema,
  },
} as const;

export function buildDailyRow(body: DailyBody, id: string) {
  return {
    id,
    name: body.name,
    location: body.location ?? null,
    description: body.description ?? null,
    completions: body.completions ?? [],
    courseProviderId: body.courseProviderId ?? null,
    resourceId: body.resourceId ?? null,
    moduleGroupId: body.moduleGroupId ?? null,
    moduleId: body.moduleId ?? null,
    taskId: body.taskId || null,
    status: body.status ?? "active",
    criteria: body.criteria ?? {},
  };
}
