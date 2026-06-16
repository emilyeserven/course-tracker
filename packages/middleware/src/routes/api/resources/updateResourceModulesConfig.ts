import { createResourceFieldUpdateHandler } from "@/utils/createResourceFieldUpdateHandler";

// Surgical update of just the resource's module-hierarchy config (the selected
// hint template). Lives apart from the full upsert so the Modules tab can save
// it without re-sending (and risking clobbering) the rest of the resource's
// columns.
export default createResourceFieldUpdateHandler({
  method: "PUT",
  path: "/:id/modulesConfig",
  description: "Update a resource's module-hierarchy config (selected hint template)",
  field: "modulesConfig",
  bodySchema: {
    type: "object",
    required: ["modulesConfig"],
    properties: {
      modulesConfig: {
        type: "object",
        properties: {
          hintTemplateId: {
            type: ["string", "null"],
          },
        },
        additionalProperties: false,
      },
    },
  },
});
