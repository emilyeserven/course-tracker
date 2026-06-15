import { describe, expect, test } from "vitest";

import { sortByPage } from "./sortByPage.ts";

describe("sortByPage", () => {
  test("sorts by pageStart ascending", () => {
    const result = sortByPage([
      {
        id: "c",
        pageStart: 30,
      },
      {
        id: "a",
        pageStart: 10,
      },
      {
        id: "b",
        pageStart: 20,
      },
    ]);
    expect(result.map(i => i.id)).toEqual(["a", "b", "c"]);
  });

  test("tie-breaks equal pageStart by pageEnd", () => {
    const result = sortByPage([
      {
        id: "wide",
        pageStart: 10,
        pageEnd: 20,
      },
      {
        id: "narrow",
        pageStart: 10,
        pageEnd: 12,
      },
    ]);
    expect(result.map(i => i.id)).toEqual(["narrow", "wide"]);
  });

  test("sorts items without a pageStart last, preserving their order", () => {
    const result = sortByPage([
      {
        id: "none-1",
        pageStart: null,
      },
      {
        id: "paged",
        pageStart: 5,
      },
      {
        id: "none-2",
      },
    ]);
    expect(result.map(i => i.id)).toEqual(["paged", "none-1", "none-2"]);
  });

  test("returns the original order when nothing has page numbers", () => {
    const input = [
      {
        id: "x",
      },
      {
        id: "y",
        pageStart: null,
      },
      {
        id: "z",
      },
    ];
    expect(sortByPage(input).map(i => i.id)).toEqual(["x", "y", "z"]);
  });

  test("does not mutate the input array", () => {
    const input = [
      {
        id: "b",
        pageStart: 20,
      },
      {
        id: "a",
        pageStart: 10,
      },
    ];
    sortByPage(input);
    expect(input.map(i => i.id)).toEqual(["b", "a"]);
  });
});
