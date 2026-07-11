import { describe, expect, test } from "vitest";

import { queryKeys } from "./queryKeys.ts";

describe("queryKeys", () => {
  test("resource keys", () => {
    expect(queryKeys.resources.list()).toEqual(["resources"]);
    expect(queryKeys.resources.detail("r1")).toEqual(["resource", "r1"]);
    expect(queryKeys.resources.modules("r1")).toEqual([
      "resource-modules",
      "r1",
    ]);
    expect(queryKeys.resources.moduleGroups("r1")).toEqual([
      "resource-module-groups",
      "r1",
    ]);
    expect(queryKeys.resources.interactions("r1")).toEqual([
      "resource-interactions",
      "r1",
    ]);
  });

  test("entity list/detail keys embed the id", () => {
    expect(queryKeys.tasks.list()).toEqual(["tasks"]);
    expect(queryKeys.tasks.detail("t1")).toEqual(["task", "t1"]);
    expect(queryKeys.routines.list()).toEqual(["routines"]);
    expect(queryKeys.routines.detail("r1")).toEqual(["routine", "r1"]);
    expect(queryKeys.dailies.list()).toEqual(["dailies"]);
    expect(queryKeys.dailies.detail("d1")).toEqual(["daily", "d1"]);
    expect(queryKeys.providers.list()).toEqual(["providers"]);
    expect(queryKeys.providers.detail("p1")).toEqual(["provider", "p1"]);
  });

  test("singleton list keys", () => {
    expect(queryKeys.tagGroups.list()).toEqual(["tagGroups"]);
    expect(queryKeys.taskTypes.list()).toEqual(["taskTypes"]);
    expect(queryKeys.modules.list()).toEqual(["modules-all"]);
    expect(queryKeys.moduleGroups.list()).toEqual(["module-groups-all"]);
    expect(queryKeys.routineTemplates.list()).toEqual(["routineTemplates"]);
    expect(queryKeys.dashboardLayouts.list()).toEqual(["dashboardLayouts"]);
    expect(queryKeys.dailyCriteriaTemplates.list()).toEqual([
      "dailyCriteriaTemplates",
    ]);
    expect(queryKeys.settings.detail()).toEqual(["settings"]);
  });

  test("integration keys", () => {
    expect(queryKeys.readwise.readingList()).toEqual([
      "readwise",
      "reading-list",
    ]);
    expect(queryKeys.todoist.tasks()).toEqual(["todoist", "tasks"]);
    expect(queryKeys.googleCalendar.events()).toEqual([
      "googleCalendar",
      "events",
    ]);
    expect(queryKeys.googleCalendar.feeds()).toEqual([
      "googleCalendar",
      "feeds",
    ]);
  });
});
