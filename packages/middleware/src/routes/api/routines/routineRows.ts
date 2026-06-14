import {
  completionSchema,
  criteriaSchema,
  curatedSchema,
  nullableInteger,
  nullableRoutineModeEnum,
  nullableRoutineStatusEnum,
  nullableString,
  routineConnectionsSchema,
  weeklySchema,
} from "../../../utils/schemas.ts";

import type { RoutineConnectionInput } from "@/utils/routineConnectionRows";
import type { RoutineCurated, RoutineWeekly } from "@/db/schema";
import type { DailyCompletion, DailyCriteria } from "@emstack/types";

// Body schema and row builder shared by the routine create and upsert
// handlers.

export interface RoutineBody {
  name: string;
  description?: string | null;
  connections?: RoutineConnectionInput[];
  status?: "active" | "inactive" | "complete" | "paused" | null;
  weekly?: RoutineWeekly;
  curated?: RoutineCurated;
  mode?: "weekly" | "daily" | "curated" | null;
  completions?: DailyCompletion[];
  criteria?: DailyCriteria;
  weeklyTarget?: number | null;
}

export const routineBodySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: {
      type: "string",
    },
    description: nullableString,
    connections: routineConnectionsSchema,
    status: nullableRoutineStatusEnum,
    weekly: weeklySchema,
    curated: curatedSchema,
    mode: nullableRoutineModeEnum,
    completions: {
      type: "array",
      items: completionSchema,
    },
    criteria: criteriaSchema,
    weeklyTarget: nullableInteger,
  },
} as const;

export function buildRoutineRow(body: RoutineBody, id: string) {
  return {
    id,
    name: body.name,
    description: body.description ?? null,
    status: body.status ?? "active",
    weekly: body.weekly ?? {},
    curated: body.curated ?? {
      endDate: null,
      entries: {},
    },
    mode: body.mode ?? "weekly",
    completions: body.completions ?? [],
    criteria: body.criteria ?? {},
    weeklyTarget: body.weeklyTarget ?? null,
  };
}
