// Short, plain-language blurbs shown under the title on each entity's list
// page (see PageHeader's `description` prop). One source of truth so the copy
// is easy to tweak and can be reused on detail pages / the dashboard later.
export const ENTITY_DESCRIPTIONS = {
  tasks:
    "Discrete pieces of work to do. Each task can carry a checklist, linked bookmarks, and an optional daily habit.",
  routines:
    "Repeatable practices you schedule and follow through on. Each routine runs on a weekly or daily cadence and can link to the tasks it supports.",
  dailies:
    "Recurring habits you track day by day. Each daily logs a status per day and measures your streak against its own goal criteria.",
} as const;
