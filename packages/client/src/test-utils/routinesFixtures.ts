import type { SelectOption } from "@/utils";
import type { RoutineReferenceItem, RoutineTemplate } from "@emstack/types";

/**
 * Mock-data factories for the `components/routines/*` Storybook stories. The
 * weekly editors take `SelectOption[]` task/resource pickers, `RoutineEntryLabel`
 * resolves ids through name maps, and `RoutineTemplateEditModal` takes a
 * `RoutineTemplate` — none of which match `boxFixtures.makeRoutine` (the
 * content-box `Routine` shape), so this area gets its own factories.
 */

export const taskOptions: SelectOption[] = [
  {
    value: "task-1",
    label: "Read a chapter",
  },
  {
    value: "task-2",
    label: "Write practice exercises",
  },
];

export const resourceOptions: SelectOption[] = [
  {
    value: "resource-1",
    label: "Duolingo Spanish",
  },
  {
    value: "resource-2",
    label: "SICP",
  },
];

// Module groups / modules belonging to resource-1 (Duolingo Spanish), used to
// exercise the resource-entry narrowing pickers. Module-local: only the
// per-resource maps and name lookups below are consumed by stories.
const moduleGroupOptions: SelectOption[] = [
  {
    value: "group-1",
    label: "Unit 1",
  },
];

const moduleOptions: SelectOption[] = [
  {
    value: "module-1",
    label: "Basics 1",
  },
  {
    value: "module-2",
    label: "Basics 2",
  },
];

// Per-resource option maps keyed by resource id (the shape the schedule fields
// take). Only resource-1 has a module hierarchy.
export const moduleGroupsByResource = new Map([
  ["resource-1", moduleGroupOptions],
]);
export const modulesByResource = new Map([["resource-1", moduleOptions]]);

// id → name maps for RoutineEntryLabel (keys align with the option values above).
export const taskNames = new Map(taskOptions.map(o => [o.value, o.label]));
export const resourceNames = new Map(resourceOptions.map(o => [o.value, o.label]));
export const moduleNames = new Map(moduleOptions.map(o => [o.value, o.label]));
export const moduleGroupNames = new Map(
  moduleGroupOptions.map(o => [o.value, o.label]),
);

export function makeReferenceItem(
  overrides: Partial<RoutineReferenceItem> = {},
): RoutineReferenceItem {
  return {
    type: "task",
    id: "task-1",
    ...overrides,
  };
}

export function makeRoutineTemplate(
  overrides: Partial<RoutineTemplate> = {},
): RoutineTemplate {
  return {
    id: "template-1",
    label: "Summer Japanese",
    weekly: {
      1: {
        type: "task",
        id: "task-1",
      },
      3: {
        type: "resource",
        id: "resource-1",
      },
    },
    ...overrides,
  };
}
