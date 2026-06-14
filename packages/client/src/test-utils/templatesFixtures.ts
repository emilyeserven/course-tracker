import type { DailyCriteriaTemplate, RoutineTemplate } from "@emstack/types";

/**
 * Mock-data builders for routine + daily-criteria templates. Used by the
 * Settings template sections and the routine edit tabs' Quick Fill menu. Each
 * `make*` takes a partial override and fills in sensible defaults, mirroring the
 * other `test-utils/*Fixtures.ts` factories.
 */

export function makeRoutineTemplate(
  overrides: Partial<RoutineTemplate> = {},
): RoutineTemplate {
  return {
    id: "rtpl-1",
    label: "Weekday mornings",
    weekly: {
      1: {
        type: "task",
        id: "task-1",
      },
      3: {
        type: "task",
        id: "task-1",
      },
      5: {
        type: "task",
        id: "task-1",
      },
    },
    ...overrides,
  };
}

export function makeRoutineTemplates(count = 2): RoutineTemplate[] {
  return Array.from(
    {
      length: count,
    },
    (_, i) =>
      makeRoutineTemplate({
        id: `rtpl-${i + 1}`,
        label: `Routine template ${i + 1}`,
      }),
  );
}

export function makeCriteriaTemplate(
  overrides: Partial<DailyCriteriaTemplate> = {},
): DailyCriteriaTemplate {
  return {
    id: "crit-1",
    label: "Reading goals",
    incomplete: "Didn't open the book.",
    touched: "Read a page or two.",
    goal: "Read for 20 minutes.",
    exceeded: "Read for 45+ minutes.",
    freeze: "Rest day — streak preserved.",
    ...overrides,
  };
}

export function makeCriteriaTemplates(count = 2): DailyCriteriaTemplate[] {
  return Array.from(
    {
      length: count,
    },
    (_, i) =>
      makeCriteriaTemplate({
        id: `crit-${i + 1}`,
        label: `Criteria template ${i + 1}`,
      }),
  );
}
