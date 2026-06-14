import { describe, expect, test } from "vitest";

import {
  makeEmptyGroupDraft,
  makeEmptyTagDraft,
  NEW_GROUP_ID,
  NEW_TAG_ID,
} from "./-tagDrafts";

describe("makeEmptyGroupDraft", () => {
  test("uses the new-group sentinel id and blank fields", () => {
    expect(makeEmptyGroupDraft()).toEqual({
      id: NEW_GROUP_ID,
      name: "",
      description: "",
      color: "",
    });
  });
});

describe("makeEmptyTagDraft", () => {
  test("uses the new-tag sentinel id and the given group id", () => {
    expect(makeEmptyTagDraft("tag-group-1")).toEqual({
      id: NEW_TAG_ID,
      groupId: "tag-group-1",
      name: "",
      color: "",
    });
  });
});
