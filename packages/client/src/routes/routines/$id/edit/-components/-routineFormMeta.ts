import type { EntityStatus, RoutineMode } from "@emstack/types";

/**
 * Radio options for the routine scheduling mode. Curated is being phased out in
 * favour of Task Lists, so it is no longer offered for new routines — see
 * `modeOptionsFor` for editing an existing curated routine.
 */
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
];

const CURATED_LEGACY_OPTION = {
  value: "curated" as RoutineMode,
  label: "Curated (legacy — convert to a Task List)",
};

/**
 * Mode options for the edit form: the standard set, plus the legacy Curated
 * option only when the routine is already curated, so its current value still
 * renders while curated stays unavailable for new/converted routines.
 */
export function modeOptionsFor(currentMode: string | null | undefined) {
  return currentMode === "curated"
    ? [...MODE_OPTIONS, CURATED_LEGACY_OPTION]
    : MODE_OPTIONS;
}

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
