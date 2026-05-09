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

export const courseStatusEnum = {
  type: "string",
  enum: ["active", "inactive", "complete"],
} as const;

export const nullableDailyStatusEnum = {
  type: ["string", "null"],
  enum: ["active", "complete", "paused", null],
} as const;

export const nullableResourceLevelEnum = {
  type: ["string", "null"],
  enum: ["low", "medium", "high", null],
} as const;

export const dailyCompletionStatusEnum = {
  type: "string",
  enum: ["incomplete", "touched", "goal", "exceeded", "freeze"],
} as const;

export const completionSchema = {
  type: "object",
  required: ["date"],
  properties: {
    date: {
      type: "string",
    },
    status: dailyCompletionStatusEnum,
    note: {
      type: "string",
    },
  },
} as const;

export const criteriaSchema = {
  type: "object",
  properties: {
    incomplete: {
      type: "string",
    },
    touched: {
      type: "string",
    },
    goal: {
      type: "string",
    },
    exceeded: {
      type: "string",
    },
  },
} as const;

export const tagsArraySchema = {
  type: "array",
  items: {
    type: "string",
  },
  default: [],
} as const;

export const tagIdsArraySchema = {
  type: "array",
  items: {
    type: "string",
  },
  default: [],
} as const;

export const resourceLinkSchema = {
  type: "object",
  required: ["resourceId"],
  properties: {
    resourceId: {
      type: "string",
    },
    moduleGroupId: nullableString,
    moduleId: nullableString,
  },
} as const;

export const resourceLinksArraySchema = {
  type: "array",
  items: resourceLinkSchema,
  default: [],
} as const;

// Schema for a task's freeform resource entry. Ease/time/interactivity/tags
// now live on the linked Resource/ModuleGroup/Module — when a row is linked,
// those properties are read from the linked entity rather than overridden
// here.
export const resourceSchema = {
  type: "object",
  required: ["name"],
  properties: {
    id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    url: nullableString,
    usedYet: {
      type: "boolean",
    },
    // Optional link to a top-level Resource. resourceId can be null while
    // moduleGroupId / moduleId stay null too — the row is a freeform task
    // resource. If resourceId is set, moduleGroupId / moduleId narrow the
    // sub-target.
    resourceId: nullableString,
    moduleGroupId: nullableString,
    moduleId: nullableString,
  },
} as const;

export const todoSchema = {
  type: "object",
  required: ["name"],
  properties: {
    id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    isComplete: {
      type: "boolean",
    },
    url: nullableString,
  },
} as const;
