import { dashboardLayouts } from "@/db/schema";
import type { DashboardLayoutTile } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { dashboardLayoutTilesSchema, nullableInteger } from "@/utils/schemas";

interface DashboardLayoutBody {
  name: string;
  position?: number | null;
  tiles?: DashboardLayoutTile[];
}

const updateableColumns = [
  "name",
  "position",
  "tiles",
] as const;

export default createUpsertHandler<DashboardLayoutBody>({
  description: "Create or update a dashboard layout",
  table: dashboardLayouts,
  bodySchema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      position: nullableInteger,
      tiles: dashboardLayoutTilesSchema,
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    position: body.position ?? null,
    tiles: (body.tiles ?? []) as DashboardLayoutTile[],
  }),
  updateableColumns,
});
