import { dashboardLayouts } from "@/db/schema";
import type { DashboardLayoutTile } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import {
  dashboardLayoutTilesSchema,
  nullableBoolean,
  nullableInteger,
} from "@/utils/schemas";

interface DashboardLayoutBody {
  name: string;
  position?: number | null;
  tiles?: DashboardLayoutTile[];
  isTemplate?: boolean | null;
}

const updateableColumns = [
  "name",
  "position",
  "tiles",
  "isTemplate",
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
      isTemplate: nullableBoolean,
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    position: body.position ?? null,
    tiles: (body.tiles ?? []) as DashboardLayoutTile[],
    isTemplate: body.isTemplate ?? false,
  }),
  updateableColumns,
});
