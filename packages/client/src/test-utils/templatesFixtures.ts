import type { DailyCriteriaTemplate } from "@emstack/types";

/**
 * Mock-data builder for daily-criteria templates (the per-status copy reused by
 * the Settings criteria-templates section and the routine Status Criteria tab's
 * Quick Fill menu). Routine templates have their own `makeRoutineTemplate` in
 * `routinesFixtures.ts`; this file only covers the criteria shape.
 */
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
