import { moduleGroups } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableInteger, nullableString } from "@/utils/schemas";

interface ModuleGroupBody {
  name: string;
  resourceId: string;
  description?: string | null;
  url?: string | null;
  position?: number | null;
  totalCount?: number | null;
  completedCount?: number | null;
}

const updateableColumns = [
  "name",
  "resourceId",
  "description",
  "url",
  "position",
  "totalCount",
  "completedCount",
] as const;

export default createUpsertHandler<ModuleGroupBody>({
  description: "Create or update a module group",
  table: moduleGroups,
  bodySchema: {
    type: "object",
    required: ["name", "resourceId"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      resourceId: {
        type: "string",
        minLength: 1,
      },
      description: nullableString,
      url: nullableString,
      position: nullableInteger,
      totalCount: nullableInteger,
      completedCount: nullableInteger,
    },
  },
  buildRow: (body, id) => ({
    id,
    resourceId: body.resourceId,
    name: body.name,
    description: body.description ?? null,
    url: body.url ?? null,
    position: body.position ?? null,
    totalCount: body.totalCount ?? null,
    completedCount: body.completedCount ?? null,
  }),
  updateableColumns,
});
