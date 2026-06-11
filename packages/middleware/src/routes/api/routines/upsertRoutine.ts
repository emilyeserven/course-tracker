import { routineConnections, routines } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { buildRoutineConnectionRows } from "@/utils/routineConnectionRows";
import {
  completionSchema,
  criteriaSchema,
  nullableRoutineModeEnum,
  nullableRoutineStatusEnum,
  nullableString,
  routineConnectionsSchema,
  weeklySchema,
} from "@/utils/schemas";

import type { RoutineConnectionInput } from "@/utils/routineConnectionRows";
import type { RoutineWeekly } from "@/db/schema";
import type { DailyCompletion, DailyCriteria } from "@emstack/types";

interface RoutineBody {
  name: string;
  description?: string | null;
  connections?: RoutineConnectionInput[];
  status?: "active" | "inactive" | "complete" | "paused" | null;
  weekly?: RoutineWeekly;
  mode?: "weekly" | "daily" | null;
  completions?: DailyCompletion[];
  criteria?: DailyCriteria;
}

export default createUpsertHandler<RoutineBody>({
  description: "Create or update a routine",
  table: routines,
  bodySchema: {
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
      mode: nullableRoutineModeEnum,
      completions: {
        type: "array",
        items: completionSchema,
      },
      criteria: criteriaSchema,
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    description: body.description ?? null,
    status: body.status ?? "active",
    weekly: body.weekly ?? {},
    mode: body.mode ?? "weekly",
    completions: body.completions ?? [],
    criteria: body.criteria ?? {},
  }),
  updateableColumns: [
    "name",
    "description",
    "status",
    "weekly",
    "mode",
    "completions",
    "criteria",
  ],
  // Partial merge: only the columns present in the request body are written
  // on update. The daily tracker / dashboard / comment popover send partial
  // payloads (e.g. just completions), so this preserves the routine's mode,
  // weekly grid and criteria instead of resetting them to defaults.
  buildSetClause: (body) => {
    const set: Record<string, unknown> = {};
    if (body.name !== undefined) {
      set.name = body.name;
    }
    if (body.description !== undefined) {
      set.description = body.description ?? null;
    }
    if (body.status !== undefined) {
      set.status = body.status ?? "active";
    }
    if (body.weekly !== undefined) {
      set.weekly = body.weekly;
    }
    if (body.mode !== undefined) {
      set.mode = body.mode ?? "weekly";
    }
    if (body.completions !== undefined) {
      set.completions = body.completions;
    }
    if (body.criteria !== undefined) {
      set.criteria = body.criteria;
    }
    return set;
  },
  junctions: [
    {
      table: routineConnections,
      foreignKey: routineConnections.routineId,
      // Only re-sync connections when the request actually carries them, so a
      // partial completion toggle never wipes the routine's links.
      buildRows: (body, id) =>
        body.connections === undefined
          ? undefined
          : buildRoutineConnectionRows(body.connections, id),
    },
  ],
  generateIdIfMissing: true,
  returnId: true,
});
