import { createResourceFieldUpdateHandler } from "@/utils/createResourceFieldUpdateHandler";

export default createResourceFieldUpdateHandler({
  method: "POST",
  path: "/:id/modulesExhaustive",
  description: "Set whether a resource's module list is exhaustive",
  field: "modulesAreExhaustive",
  bodySchema: {
    type: "object",
    required: ["modulesAreExhaustive"],
    additionalProperties: false,
    properties: {
      modulesAreExhaustive: {
        type: "boolean",
      },
    },
  },
});
