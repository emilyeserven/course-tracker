import type { TagGroup } from "@emstack/types";

import { describe, expect, test } from "vitest";

import { tagGroupsToOptions, toOptions } from "./selectOptions.ts";

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
