import { routineConnections, routines } from "@/db/schema";
import { createCreateHandler } from "@/utils/createCreateHandler";
import { buildRoutineConnectionRows } from "@/utils/routineConnectionRows";

import { buildRoutineRow, routineBodySchema } from "./routineRows";

import type { RoutineBody } from "./routineRows";

export default createCreateHandler<RoutineBody>({
  description: "Create a new routine",
  table: routines,
  bodySchema: routineBodySchema,
  buildRow: buildRoutineRow,
  junctions: [
    {
      table: routineConnections,
      buildRows: (body, id) => buildRoutineConnectionRows(body.connections, id),
    },
  ],
});
