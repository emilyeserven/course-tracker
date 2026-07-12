import type { SelectOption } from "@/utils";
import type { RoutineReferenceItem, RoutineTemplate } from "@emstack/types";

/**
 * Mock-data factories for the `components/routines/*` Storybook stories. The
 * weekly editors take `SelectOption[]` task pickers, `RoutineEntryLabel` resolves
 * ids through a task-name map, and `RoutineTemplateEditModal` takes a
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

// id → name map for RoutineEntryLabel (keys align with the option values above).
export const taskNames = new Map(taskOptions.map(o => [o.value, o.label]));

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
        type: "bookmark",
        id: "bookmark-1",
        title: "Reference doc",
      },
    },
    ...overrides,
  };
}
