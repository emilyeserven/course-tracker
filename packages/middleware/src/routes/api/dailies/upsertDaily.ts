import { dailies } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import {
  completionSchema,
  criteriaSchema,
  nullableDailyStatusEnum,
  nullableString,
} from "@/utils/schemas";

import type { DailyCompletion, DailyCriteria } from "@emstack/types";

interface DailyBody {
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

const updateableColumns = [
  "name",
  "location",
  "description",
  "completions",
  "courseProviderId",
  "resourceId",
  "moduleGroupId",
  "moduleId",
  "taskId",
  "status",
  "criteria",
] as const;

export default createUpsertHandler<DailyBody>({
  description: "Create or update a daily",
  table: dailies,
  bodySchema: {
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
  },
  buildRow: (body, id) => ({
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
  }),
  updateableColumns,
  generateIdIfMissing: true,
  returnId: true,
});
