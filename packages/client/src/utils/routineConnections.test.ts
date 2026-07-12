import { describe, expect, test } from "vitest";

import {
  buildConnectionOptions,
  connectionEntityKind,
  decodeConnection,
  encodeConnection,
} from "./routineConnections.ts";

describe("encode/decode connection", () => {
  test("round-trips each connection type", () => {
    for (const type of ["task"] as const) {
      const encoded = encodeConnection({
        type,
        id: "abc-123",
      });
      expect(decodeConnection(encoded)).toEqual({
        type,
        id: "abc-123",
      });
    }
  });

  test("encodes with a capitalized group prefix for nice headers", () => {
    expect(
      encodeConnection({
        type: "task",
        id: "t1",
      }),
    ).toBe("Task:t1");
  });

  test("decodes an id that itself contains nothing weird", () => {
    expect(decodeConnection("Task:uuid-with-no-colon")).toEqual({
      type: "task",
      id: "uuid-with-no-colon",
    });
  });

  test("returns null for malformed or unknown values", () => {
    expect(decodeConnection("")).toBeNull();
    expect(decodeConnection("nocolon")).toBeNull();
    expect(decodeConnection("Topic:")).toBeNull();
    expect(decodeConnection("Bogus:id")).toBeNull();
    expect(decodeConnection(":id")).toBeNull();
  });
});

describe("connectionEntityKind", () => {
  test("maps connection types to EntityLink kinds", () => {
    expect(connectionEntityKind("task")).toBe("tasks");
  });
});

describe("buildConnectionOptions", () => {
  test("prefixes each entity value by type and tags it with a dropdown group", () => {
    const options = buildConnectionOptions([
      {
        id: "k1",
        name: "Finish module",
      },
    ]);
    expect(options).toEqual([
      {
        value: "Task:k1",
        label: "Finish module",
        group: "Tasks",
      },
    ]);
  });

  test("groups all tasks under a single Tasks group", () => {
    const options = buildConnectionOptions([
      {
        id: "k1",
        name: "Zebra",
      },
      {
        id: "k2",
        name: "Apple",
      },
    ]);
    expect(options).toEqual([
      {
        value: "Task:k1",
        label: "Zebra",
        group: "Tasks",
      },
      {
        value: "Task:k2",
        label: "Apple",
        group: "Tasks",
      },
    ]);
  });

  test("handles missing lists", () => {
    expect(buildConnectionOptions(null)).toEqual([]);
  });
});
