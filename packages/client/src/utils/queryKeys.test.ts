import { describe, expect, test } from "vitest";

import { queryKeys } from "./queryKeys.ts";

describe("queryKeys", () => {
  test("entity list/detail keys embed the id", () => {
    expect(queryKeys.tasks.list()).toEqual(["tasks"]);
    expect(queryKeys.tasks.detail("t1")).toEqual(["task", "t1"]);
    expect(queryKeys.routines.list()).toEqual(["routines"]);
    expect(queryKeys.routines.detail("r1")).toEqual(["routine", "r1"]);
    expect(queryKeys.dailies.list()).toEqual(["dailies"]);
    expect(queryKeys.dailies.detail("d1")).toEqual(["daily", "d1"]);
  });

  test("singleton list keys", () => {
    expect(queryKeys.tagGroups.list()).toEqual(["tagGroups"]);
    expect(queryKeys.taskTypes.list()).toEqual(["taskTypes"]);
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
