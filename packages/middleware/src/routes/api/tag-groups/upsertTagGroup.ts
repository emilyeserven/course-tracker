import type { TagGroup } from "@emstack/types";
import { tagGroups } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableInteger, nullableString } from "@/utils/schemas";

type TagGroupBody = Omit<TagGroup, "id" | "tags">;

const updateableColumns = ["name", "description", "color", "position"] as const;

export default createUpsertHandler<TagGroupBody>({
  description: "Create or update a tag group",
  table: tagGroups,
  bodySchema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      description: nullableString,
      color: nullableString,
      position: nullableInteger,
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    description: body.description ?? null,
    color: body.color ?? null,
    position: body.position ?? null,
  }),
  updateableColumns,
});
