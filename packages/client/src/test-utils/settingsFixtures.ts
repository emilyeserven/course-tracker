import type {
  AppSettingsSummary,
  CalendarFeedSummary,
  DashboardLayout,
  TaskType,
} from "@emstack/types";

import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryKeys } from "@/utils/queryKeys";

/**
 * Mock-data factories for the Settings page sections and the dashboard
 * layout dialogs. Each `make*` takes a partial override and fills in sensible
 * defaults, mirroring the other `test-utils/*Fixtures.ts` factories.
 */

export function makeAppSettings(
  overrides: Partial<AppSettingsSummary> = {},
): AppSettingsSummary {
  return {
    readwiseConfigured: false,
    readwiseKeyHint: null,
    todoistConfigured: false,
    todoistKeyHint: null,
    focusedDomainIds: [],
    ...overrides,
  };
}

/** A QueryStub client pre-seeded with the settings detail a section reads. */
export function seededSettingsClient(
  overrides: Partial<AppSettingsSummary> = {},
) {
  return seededQueryClient([
    [queryKeys.settings.detail(), makeAppSettings(overrides)],
  ]);
}

export function makeTaskType(overrides: Partial<TaskType> = {}): TaskType {
  return {
    id: "tt-1",
    name: "Deep work",
    whenToUse: "Focused, uninterrupted sessions.",
    tags: ["focus", "deep-work"],
    ...overrides,
  };
}

export function makeCalendarFeed(
  overrides: Partial<CalendarFeedSummary> = {},
): CalendarFeedSummary {
  return {
    id: "feed-1",
    name: "Personal",
    urlHint: "calendar.google.com/…/basic.ics",
    color: "#2563eb",
    ...overrides,
  };
}

export function makeLayout(
  overrides: Partial<DashboardLayout> = {},
): DashboardLayout {
  return {
    id: "layout-1",
    name: "Main",
    position: 0,
    tiles: [
      {
        tileId: "doNow",
        x: 0,
        y: 0,
        w: 4,
        h: 6,
      },
    ],
    isTemplate: false,
    ...overrides,
  };
}
