import { routineConnections, routines } from "@/db/schema";
import { createCreateHandler } from "@/utils/createCreateHandler";
import { buildRoutineConnectionRows } from "@/utils/routineConnectionRows";

import { bakeRoutineCompletions } from "./bakeRoutineCompletions";
import { buildRoutineRow, routineBodySchema } from "./routineRows";

import type { RoutineBody } from "./routineRows";

export default createCreateHandler<RoutineBody>({
  description: "Create a new routine",
  table: routines,
  bodySchema: routineBodySchema,
  buildRow: buildRoutineRow,
  // Symmetric with upsert: bake task text onto any statused completions sent at
  // create time (rare, but keeps the two paths consistent).
  prepareBody: bakeRoutineCompletions,
  junctions: [
    {
      table: routineConnections,
      buildRows: (body, id) => buildRoutineConnectionRows(body.connections, id),
    },
  ],
});
