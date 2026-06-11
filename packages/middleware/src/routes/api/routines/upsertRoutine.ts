import { routineConnections, routines } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { buildRoutineConnectionRows } from "@/utils/routineConnectionRows";

import { buildRoutineRow, routineBodySchema } from "./routineRows";

import type { RoutineBody } from "./routineRows";

export default createUpsertHandler<RoutineBody>({
  description: "Create or update a routine",
  table: routines,
  bodySchema: routineBodySchema,
  buildRow: buildRoutineRow,
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
