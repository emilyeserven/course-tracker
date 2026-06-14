import type {
  AppSettingsSummary,
  DashboardLayout,
} from "@emstack/types";

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
