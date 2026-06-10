import { describe, expect, test } from "vitest";

import {
  buildConnectionOptions,
  connectionEntityKind,
  decodeConnection,
  encodeConnection,
} from "./routineConnections.ts";

describe("encode/decode connection", () => {
  test("round-trips each connection type", () => {
    for (const type of ["topic", "task", "resource"] as const) {
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
    expect(encodeConnection({
      type: "topic",
      id: "t1",
    })).toBe("Topic:t1");
  });

  test("decodes an id that itself contains nothing weird", () => {
    expect(decodeConnection("Resource:uuid-with-no-colon")).toEqual({
      type: "resource",
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
    expect(connectionEntityKind("topic")).toBe("topics");
    expect(connectionEntityKind("task")).toBe("tasks");
    expect(connectionEntityKind("resource")).toBe("resources");
  });
});

describe("buildConnectionOptions", () => {
  test("prefixes each entity by its group and keeps the bare name as label", () => {
    const options = buildConnectionOptions(
      [{
        id: "t1",
        name: "React",
      }],
      [{
        id: "k1",
        name: "Finish module",
      }],
      [{
        id: "r1",
        name: "Docs site",
      }],
    );
    expect(options).toEqual([
      {
        value: "Topic:t1",
        label: "React",
      },
      {
        value: "Task:k1",
        label: "Finish module",
      },
      {
        value: "Resource:r1",
        label: "Docs site",
      },
    ]);
  });

  test("handles missing lists", () => {
    expect(buildConnectionOptions(null, undefined, [])).toEqual([]);
  });
});
