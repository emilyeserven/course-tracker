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

// Routines use the full lifecycle status set, including "inactive" as a manual
// status (any number of routines may be active at once).
export const nullableRoutineStatusEnum = {
  type: ["string", "null"],
  enum: ["active", "inactive", "complete", "paused", null],
} as const;

// Weekly schedule vs. daily task. Both carry completion tracking; the mode only
// changes how the weekly grid is edited (per-day vs. same entry every day).
export const nullableRoutineModeEnum = {
  type: ["string", "null"],
  enum: ["weekly", "daily", null],
} as const;

export const routineReferenceItemSchema = {
  type: "object",
  required: ["type", "id"],
  properties: {
    type: {
      type: "string",
      enum: ["task", "resource", "freeform"],
    },
    id: {
      type: "string",
    },
    notes: nullableString,
  },
} as const;

// Optional properties "0".."6" (Date.getDay() order), each a {type, id}. No
// `required`, so every day is optional; additionalProperties:false keeps stray
// keys out.
export const weeklySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    0: routineReferenceItemSchema,
    1: routineReferenceItemSchema,
    2: routineReferenceItemSchema,
    3: routineReferenceItemSchema,
    4: routineReferenceItemSchema,
    5: routineReferenceItemSchema,
    6: routineReferenceItemSchema,
  },
} as const;

// A routine's polymorphic connection to a topic / task / resource. `id` is the
// connected entity's id; the resolved name is added on read, not accepted here.
export const routineConnectionTypeEnum = {
  type: "string",
  enum: ["topic", "task", "resource"],
} as const;

export const routineConnectionItemSchema = {
  type: "object",
  required: ["type", "id"],
  additionalProperties: false,
  properties: {
    type: routineConnectionTypeEnum,
    id: {
      type: "string",
    },
  },
} as const;

export const routineConnectionsSchema = {
  type: "array",
  items: routineConnectionItemSchema,
} as const;

export const dailyCompletionStatusEnum = {
  type: "string",
  enum: ["incomplete", "touched", "goal", "exceeded", "freeze"],
} as const;

export const interactionProgressEnum = {
  type: "string",
  enum: ["incomplete", "started", "complete"],
} as const;

export const nullableInteractionDifficultyEnum = {
  type: ["string", "null"],
  enum: ["easy", "medium", "hard", null],
} as const;

export const nullableInteractionUnderstandingEnum = {
  type: ["string", "null"],
  enum: ["none", "basic", "comfortable", "proficient", "mastered", null],
} as const;

export const interactionBodySchema = {
  type: "object",
  required: ["resourceId", "date", "progress"],
  properties: {
    resourceId: {
      type: "string",
      minLength: 1,
    },
    moduleGroupId: nullableString,
    moduleId: nullableString,
    date: {
      type: "string",
    },
    progress: interactionProgressEnum,
    note: nullableString,
    difficulty: nullableInteractionDifficultyEnum,
    understanding: nullableInteractionUnderstandingEnum,
  },
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
    freeze: {
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
