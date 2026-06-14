import type { EntityStatus, RoutineMode } from "@emstack/types";

/** Radio options for the routine scheduling mode, shared by the edit and create forms. */
export const MODE_OPTIONS: { value: RoutineMode;
  label: string; }[] = [
  {
    value: "weekly",
    label: "Weekly Schedule",
  },
  {
    value: "daily",
    label: "Daily Task",
  },
  {
    value: "curated",
    label: "Curated",
  },
];

/** Radio options for the routine status field. */
export const STATUS_OPTIONS: { value: EntityStatus;
  label: string; }[] = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
  {
    value: "complete",
    label: "Complete",
  },
  {
    value: "paused",
    label: "Paused",
  },
];
