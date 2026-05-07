export const idParamSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
  },
  required: ["id"],
} as const;

export const nullableString = {
  type: ["string", "null"],
} as const;

export const nullableBoolean = {
  type: ["boolean", "null"],
} as const;

export const nullableInteger = {
  type: ["integer", "null"],
} as const;
