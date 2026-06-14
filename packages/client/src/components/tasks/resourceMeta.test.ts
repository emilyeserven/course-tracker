import type { Module, ModuleGroup, TaskResource } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  getResourceLevelClass,
  getResourceLevelLabel,
  inheritedLevel,
  linkedResourceLabel,
} from "./resourceMeta";

function makeTaskResource(overrides: Partial<TaskResource> = {}): TaskResource {
  return {
    id: "tr-1",
    taskId: "task-1",
    name: "A task resource",
    usedYet: false,
    ...overrides,
  };
}

function makeModule(overrides: Partial<Module> = {}): Module {
  return {
    id: "module-1",
    resourceId: "res-1",
    name: "Module 1",
    isComplete: false,
    ...overrides,
  };
}

function makeModuleGroup(overrides: Partial<ModuleGroup> = {}): ModuleGroup {
  return {
    id: "group-1",
    resourceId: "res-1",
    name: "Group 1",
    ...overrides,
  };
}

describe("inheritedLevel", () => {
  test("prefers the level on the row's joined module", () => {
    const resource = makeTaskResource({
      module: {
        id: "module-1",
        name: "Module 1",
        easeOfStarting: "high",
      },
      resource: {
        id: "res-1",
        name: "Resource 1",
        easeOfStarting: "low",
      },
    });
    expect(inheritedLevel(resource, "easeOfStarting", [], [])).toBe("high");
  });

  test("falls back to the module's parent group looked up via the all-lists", () => {
    // The row narrows to a module with no override and a null joined
    // moduleGroup — the parent group must be found via allModules /
    // allModuleGroups.
    const resource = makeTaskResource({
      moduleId: "module-1",
      module: {
        id: "module-1",
        name: "Module 1",
      },
      moduleGroup: null,
      resource: {
        id: "res-1",
        name: "Resource 1",
        timeNeeded: "low",
      },
    });
    const allModules = [
      makeModule({
        id: "module-1",
        moduleGroupId: "group-1",
      }),
    ];
    const allModuleGroups = [
      makeModuleGroup({
        id: "group-1",
        timeNeeded: "medium",
      }),
    ];
    expect(
      inheritedLevel(resource, "timeNeeded", allModules, allModuleGroups),
    ).toBe("medium");
  });

  test("falls back to the row's joined module group when the module carries no level", () => {
    const resource = makeTaskResource({
      moduleGroup: {
        id: "group-1",
        name: "Group 1",
        interactivity: "medium",
      },
      resource: {
        id: "res-1",
        name: "Resource 1",
        interactivity: "low",
      },
    });
    expect(inheritedLevel(resource, "interactivity", [], [])).toBe("medium");
  });

  test("falls back to the linked resource when neither module nor group carry a level", () => {
    const resource = makeTaskResource({
      module: {
        id: "module-1",
        name: "Module 1",
      },
      moduleGroup: {
        id: "group-1",
        name: "Group 1",
      },
      resource: {
        id: "res-1",
        name: "Resource 1",
        easeOfStarting: "low",
      },
    });
    expect(inheritedLevel(resource, "easeOfStarting", [], [])).toBe("low");
  });

  test("skips the parent-group lookup when the parent group has no level", () => {
    const resource = makeTaskResource({
      moduleId: "module-1",
      resource: {
        id: "res-1",
        name: "Resource 1",
        timeNeeded: "high",
      },
    });
    const allModules = [
      makeModule({
        id: "module-1",
        moduleGroupId: "group-1",
      }),
    ];
    const allModuleGroups = [makeModuleGroup({
      id: "group-1",
    })];
    expect(
      inheritedLevel(resource, "timeNeeded", allModules, allModuleGroups),
    ).toBe("high");
  });

  test("returns null when nothing in the chain carries a level", () => {
    const resource = makeTaskResource({
      module: {
        id: "module-1",
        name: "Module 1",
      },
      moduleGroup: {
        id: "group-1",
        name: "Group 1",
      },
      resource: {
        id: "res-1",
        name: "Resource 1",
      },
    });
    expect(inheritedLevel(resource, "easeOfStarting", [], [])).toBeNull();
  });

  test("returns null for a fully unlinked row", () => {
    const resource = makeTaskResource();
    expect(inheritedLevel(resource, "easeOfStarting", [], [])).toBeNull();
  });
});

describe("linkedResourceLabel", () => {
  test("joins module > group > resource, most specific first", () => {
    const resource = makeTaskResource({
      resource: {
        id: "res-1",
        name: "Resource 1",
      },
      moduleGroup: {
        id: "group-1",
        name: "Group 1",
      },
      module: {
        id: "module-1",
        name: "Module 1",
      },
    });
    expect(linkedResourceLabel(resource)).toBe(
      "Module 1 > Group 1 > Resource 1",
    );
  });

  test("omits missing segments", () => {
    const resource = makeTaskResource({
      resource: {
        id: "res-1",
        name: "Resource 1",
      },
      module: {
        id: "module-1",
        name: "Module 1",
      },
    });
    expect(linkedResourceLabel(resource)).toBe("Module 1 > Resource 1");
  });

  test("returns just the resource name for a whole-resource link", () => {
    const resource = makeTaskResource({
      resource: {
        id: "res-1",
        name: "Resource 1",
      },
    });
    expect(linkedResourceLabel(resource)).toBe("Resource 1");
  });

  test("returns null when the row is not linked", () => {
    expect(linkedResourceLabel(makeTaskResource())).toBeNull();
  });
});

describe("getResourceLevelLabel", () => {
  test("returns the human label for each level", () => {
    expect(getResourceLevelLabel("low")).toBe("Low");
    expect(getResourceLevelLabel("medium")).toBe("Medium");
    expect(getResourceLevelLabel("high")).toBe("High");
  });

  test("returns an em dash for a missing level", () => {
    expect(getResourceLevelLabel(null)).toBe("—");
    expect(getResourceLevelLabel(undefined)).toBe("—");
  });
});

describe("getResourceLevelClass", () => {
  test("returns a distinct class string per known level", () => {
    const low = getResourceLevelClass("low");
    const medium = getResourceLevelClass("medium");
    const high = getResourceLevelClass("high");
    expect(low).toContain("emerald");
    expect(medium).toContain("amber");
    expect(high).toContain("rose");
    expect(new Set([low, medium, high]).size).toBe(3);
  });

  test("returns the muted fallback class for an unknown/absent level", () => {
    expect(getResourceLevelClass(null)).toContain("muted");
    expect(getResourceLevelClass(undefined)).toContain("muted");
  });
});
