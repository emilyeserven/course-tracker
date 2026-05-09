import { tags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableInteger, nullableString } from "@/utils/schemas";

interface TagBody {
  name: string;
  groupId: string;
  color?: string | null;
  position?: number | null;
}

const updateableColumns = ["name", "groupId", "color", "position"] as const;

export default createUpsertHandler<TagBody>({
  description: "Create or update a tag",
  table: tags,
  bodySchema: {
    type: "object",
    required: ["name", "groupId"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      groupId: {
        type: "string",
        minLength: 1,
      },
      color: nullableString,
      position: nullableInteger,
    },
  },
  buildRow: (body, id) => ({
    id,
    groupId: body.groupId,
    name: body.name,
    color: body.color ?? null,
    position: body.position ?? null,
  }),
  updateableColumns,
});
