import type { TagGroup } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  groupOptionsByResource,
  tagGroupsToOptions,
  toOptions,
} from "./selectOptions.ts";

describe("toOptions", () => {
  test("maps {id, name} entities to {value, label}", () => {
    expect(
      toOptions([
        {
          id: "a",
          name: "Alpha",
        },
        {
          id: "b",
          name: "Beta",
        },
      ]),
    ).toEqual([
      {
        value: "a",
        label: "Alpha",
      },
      {
        value: "b",
        label: "Beta",
      },
    ]);
  });

  test("returns an empty array for null/undefined", () => {
    expect(toOptions(null)).toEqual([]);
    expect(toOptions(undefined)).toEqual([]);
  });

  test("carries a url when the entity has one", () => {
    const [option] = toOptions([
      {
        id: "a",
        name: "Alpha",
        url: "https://example.com/a",
      },
    ]);
    expect(option.url).toBe("https://example.com/a");
  });
});

describe("groupOptionsByResource", () => {
  test("buckets by resource and carries group + url", () => {
    const byResource = groupOptionsByResource([
      {
        id: "mod-1",
        name: "Lesson 1",
        resourceId: "res-1",
        moduleGroupId: "grp-1",
        url: "https://example.com/lesson-1",
      },
      {
        id: "mod-2",
        name: "Lesson 2",
        resourceId: "res-1",
        moduleGroupId: "grp-1",
      },
    ]);
    expect(byResource.get("res-1")).toEqual([
      {
        value: "mod-1",
        label: "Lesson 1",
        group: "grp-1",
        url: "https://example.com/lesson-1",
      },
      {
        value: "mod-2",
        label: "Lesson 2",
        group: "grp-1",
      },
    ]);
  });
});

describe("tagGroupsToOptions", () => {
  test("flattens tags across groups into options", () => {
    const groups: TagGroup[] = [
      {
        id: "g1",
        name: "Group 1",
        tags: [
          {
            id: "t1",
            groupId: "g1",
            name: "Tag 1",
          },
          {
            id: "t2",
            groupId: "g1",
            name: "Tag 2",
          },
        ],
      },
      {
        id: "g2",
        name: "Group 2",
        tags: [
          {
            id: "t3",
            groupId: "g2",
            name: "Tag 3",
          },
        ],
      },
    ];
    expect(tagGroupsToOptions(groups)).toEqual([
      {
        value: "t1",
        label: "Tag 1",
      },
      {
        value: "t2",
        label: "Tag 2",
      },
      {
        value: "t3",
        label: "Tag 3",
      },
    ]);
  });

  test("handles groups with no tags", () => {
    const groups: TagGroup[] = [
      {
        id: "g1",
        name: "Group 1",
      },
    ];
    expect(tagGroupsToOptions(groups)).toEqual([]);
  });

  test("returns an empty array for null/undefined", () => {
    expect(tagGroupsToOptions(null)).toEqual([]);
    expect(tagGroupsToOptions(undefined)).toEqual([]);
  });
});
