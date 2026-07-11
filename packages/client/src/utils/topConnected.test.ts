import { describe, expect, test } from "vitest";

import { topConnected } from "./topConnected.ts";

describe("topConnected ranker", () => {
  interface Row {
    id: string;
    name: string;
    count: number;
  }
  const make = (id: string, name: string, count: number): Row => ({
    id,
    name,
    count,
  });
  const getName = (i: Row) => i.name;
  const getCount = (i: Row) => i.count;

  test("returns [] for undefined or empty input", () => {
    expect(topConnected<Row>(undefined, getName, getCount)).toEqual([]);
    expect(topConnected<Row>([], getName, getCount)).toEqual([]);
  });

  test("drops items with no connections", () => {
    const items = [make("a", "A", 0), make("b", "B", 2)];
    expect(topConnected(items, getName, getCount)).toEqual([
      {
        id: "b",
        name: "B",
        count: 2,
      },
    ]);
  });

  test("sorts by count desc, breaks ties alphabetically, caps at limit", () => {
    const items = [
      make("a", "Beta", 5),
      make("b", "Alpha", 5),
      make("c", "Gamma", 9),
      make("d", "Delta", 1),
    ];
    expect(topConnected(items, getName, getCount)).toEqual([
      {
        id: "c",
        name: "Gamma",
        count: 9,
      },
      {
        id: "b",
        name: "Alpha",
        count: 5,
      },
      {
        id: "a",
        name: "Beta",
        count: 5,
      },
    ]);
  });

  test("respects a custom limit", () => {
    const items = [make("a", "A", 3), make("b", "B", 2), make("c", "C", 1)];
    expect(topConnected(items, getName, getCount, 2)).toHaveLength(2);
  });

  test("uses the supplied name accessor (rows exposing `title`)", () => {
    interface TitledRow {
      id: string;
      title: string;
      topicCount: number;
    }
    const rows: TitledRow[] = [
      {
        id: "d1",
        title: "Backend",
        topicCount: 4,
      },
      {
        id: "d2",
        title: "Frontend",
        topicCount: 7,
      },
    ];
    expect(
      topConnected(
        rows,
        r => r.title,
        r => r.topicCount,
      ),
    ).toEqual([
      {
        id: "d2",
        name: "Frontend",
        count: 7,
      },
      {
        id: "d1",
        name: "Backend",
        count: 4,
      },
    ]);
  });
});
