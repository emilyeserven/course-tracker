// Short, plain-language blurbs shown under the title on each entity's list
// page (see PageHeader's `description` prop). One source of truth so the copy
// is easy to tweak and can be reused on detail pages / the dashboard later.
export const ENTITY_DESCRIPTIONS = {
  resources:
    "Courses, videos, books — anything you learn from. Each resource tracks its provider, progress, cost, and the modules inside it.",
  topics:
    "The subjects and skills you want to learn. Topics are concepts in their own right, independent of any one resource, and link to the resources and tasks that cover them.",
  tasks:
    "Discrete pieces of work to do. Each task can carry a checklist, linked resources, and an optional daily habit.",
  routines:
    "Repeatable practices you schedule and follow through on. Each routine runs on a weekly or daily cadence and can link to the topics, tasks, and resources it supports.",
  dailies:
    "Recurring habits you track day by day. Each daily logs a status per day and measures your streak against its own goal criteria.",
  providers:
    "The platforms and vendors your resources come from. Providers track cost, subscriptions, and which resources belong to them.",
} as const;
