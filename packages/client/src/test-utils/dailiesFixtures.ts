import type {
  Daily,
  DailyCompletion,
  DailyCompletionStatus,
} from "@emstack/types";

import { getTodayKey, shiftDateKey } from "@/utils";

/**
 * Mock-data factories for dailies Storybook stories and tests. Kept here (rather
 * than re-rolled per file) so every story builds a `Daily` the same way.
 *
 * Completion dates are derived **relative to today** so "today"-matching
 * components (comment popover, status modal, weekly title) stay correct whatever
 * date the suite runs on.
 */

export function makeResource(
  overrides: Partial<NonNullable<Daily["resource"]>> = {},
): NonNullable<Daily["resource"]> {
  return {
    id: "res-1",
    name: "Structure and Interpretation of Computer Programs",
    progressCurrent: 15,
    progressTotal: 50,
    ...overrides,
  };
}

export function makeTask(
  overrides: Partial<NonNullable<Daily["task"]>> = {},
): NonNullable<Daily["task"]> {
  return {
    id: "task-1",
    name: "Build the widget",
    progress: {
      todosTotal: 5,
      todosComplete: 3,
      resourcesTotal: 2,
      resourcesUsed: 1,
    },
    ...overrides,
  };
}

/**
 * Build completion entries ending today. The last status maps to today, the one
 * before it to yesterday, and so on; `null` entries are skipped (no entry that
 * day). Pass `{ note }` on the final status by overriding afterwards if needed.
 */
export function makeRecentCompletions(
  statuses: (DailyCompletionStatus | null)[],
  todayKey: string = getTodayKey(),
): DailyCompletion[] {
  const lastIndex = statuses.length - 1;
  return statuses.flatMap((status, i) => {
    if (status === null) {
      return [];
    }
    return [
      {
        date: shiftDateKey(todayKey, -(lastIndex - i)),
        status,
      },
    ];
  });
}

export function makeDaily(overrides: Partial<Daily> = {}): Daily {
  return {
    id: "daily-1",
    name: "Morning reading",
    completions: [],
    status: "active",
    ...overrides,
  };
}
