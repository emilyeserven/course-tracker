import { DASHBOARD_TILE_IDS } from "@emstack/types";

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

// Routines use the full lifecycle status set, including "inactive" as a manual
// status (any number of routines may be active at once).
export const nullableRoutineStatusEnum = {
  type: ["string", "null"],
  enum: ["active", "inactive", "complete", "paused", null],
} as const;

// Weekly schedule, daily task, or curated date-keyed run. All carry completion
// tracking; the mode only changes how the schedule grid is edited.
export const nullableRoutineModeEnum = {
  type: ["string", "null"],
  enum: ["weekly", "daily", "curated", null],
} as const;

const routineReferenceItemSchema = {
  type: "object",
  required: ["type", "id"],
  properties: {
    type: {
      type: "string",
      enum: ["task", "freeform", "bookmark"],
    },
    id: {
      type: "string",
    },
    notes: nullableString,
    location: nullableString,
    prependText: nullableString,
    appendText: nullableString,
    // Bookmark entries only: cached title/url + optional section narrowing.
    title: nullableString,
    url: nullableString,
    sectionId: nullableString,
    sectionLabel: nullableString,
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

// Curated mode's schedule: a chosen end date plus a map of date keys
// ("YYYY-MM-DD") to that date's item. Unlike weeklySchema (fixed 0–6 keys),
// `entries` is keyed by arbitrary date strings, so it uses additionalProperties.
export const curatedSchema = {
  type: "object",
  properties: {
    endDate: nullableString,
    entries: {
      type: "object",
      additionalProperties: routineReferenceItemSchema,
    },
  },
} as const;

// A routine's polymorphic connection to a task / bookmark.
// `id` is the connected entity's id. For local types the name is resolved on
// read; for "bookmark" (external, no local row) the client also sends the cached
// `name`/`url`, which are stored on the connection.
const routineConnectionTypeEnum = {
  type: "string",
  enum: ["task", "bookmark"],
} as const;

const routineConnectionItemSchema = {
  type: "object",
  required: ["type", "id"],
  additionalProperties: false,
  properties: {
    type: routineConnectionTypeEnum,
    id: {
      type: "string",
    },
    // Bookmark connections only: cached title/url + optional section narrowing
    // (ignored for local types).
    name: nullableString,
    url: nullableString,
    sectionId: nullableString,
    sectionLabel: nullableString,
  },
} as const;

export const routineConnectionsSchema = {
  type: "array",
  items: routineConnectionItemSchema,
} as const;

const dailyCompletionStatusEnum = {
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
    // Baked snapshot of the date's scheduled item (set server-side at save time).
    // Nullable: null means nothing was scheduled that date.
    entryParts: {
      type: ["object", "null"],
      required: ["name"],
      properties: {
        prependText: nullableString,
        name: {
          type: "string",
        },
        appendText: nullableString,
      },
    },
    // Structured reference (kind + id) of the scheduled item, baked alongside
    // entryParts. Nullable: null means nothing was scheduled that date.
    entryRef: {
      type: ["object", "null"],
      required: ["type", "id"],
      properties: {
        type: {
          type: "string",
          enum: ["task", "freeform", "bookmark"],
        },
        id: {
          type: "string",
        },
      },
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

// One enabled dashboard tile and its placement in the 4-column grid.
const dashboardLayoutTileSchema = {
  type: "object",
  required: ["tileId", "x", "y", "w", "h"],
  additionalProperties: false,
  properties: {
    tileId: {
      type: "string",
      enum: DASHBOARD_TILE_IDS,
    },
    x: {
      type: "integer",
      minimum: 0,
    },
    y: {
      type: "integer",
      minimum: 0,
    },
    w: {
      type: "integer",
      minimum: 1,
      maximum: 4,
    },
    h: {
      type: "integer",
      minimum: 1,
    },
    heightMode: {
      type: "string",
      enum: ["auto", "fixed"],
    },
    showProject: {
      type: "boolean",
    },
    showLabels: {
      type: "boolean",
    },
    showDescription: {
      type: "boolean",
    },
    showOverdue: {
      type: "boolean",
    },
    // Do Now / Done for the Day tiles only — per-column show/hide state. Keys
    // mirror DAILY_TRACKER_TOGGLEABLE_COLUMNS in @emstack/types.
    columns: {
      type: "object",
      additionalProperties: false,
      properties: {
        progress: {
          type: "boolean",
        },
        routine: {
          type: "boolean",
        },
        type: {
          type: "boolean",
        },
        cadence: {
          type: "boolean",
        },
        streak: {
          type: "boolean",
        },
        total: {
          type: "boolean",
        },
        comment: {
          type: "boolean",
        },
        days: {
          type: "boolean",
        },
        location: {
          type: "boolean",
        },
      },
    },
  },
} as const;

export const dashboardLayoutTilesSchema = {
  type: "array",
  items: dashboardLayoutTileSchema,
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
} as const;

// A task's association to a Simple Bookmarks bookmark. `bookmarkId` is the
// external id in the companion app; `title` / `url` are the denormalized cache
// stored so the chip renders when Simple Bookmarks is unreachable.
const bookmarkLinkSchema = {
  type: "object",
  required: ["bookmarkId", "title"],
  properties: {
    id: {
      type: "string",
    },
    bookmarkId: {
      type: "string",
    },
    title: {
      type: "string",
    },
    url: nullableString,
    // Optional narrowing to a section of the bookmark (null = whole bookmark).
    sectionId: nullableString,
    sectionLabel: nullableString,
  },
} as const;

export const bookmarkLinksArraySchema = {
  type: "array",
  items: bookmarkLinkSchema,
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
    // Same 5-state set as routine tasks.
    status: dailyCompletionStatusEnum,
    dueDate: nullableString,
    note: nullableString,
    location: nullableString,
    url: nullableString,
    // Associations to Simple Bookmarks bookmarks.
    bookmarks: bookmarkLinksArraySchema,
  },
} as const;
