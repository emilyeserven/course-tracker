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
  test("prefixes each entity value by type and tags it with a dropdown group", () => {
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
        group: "Topics · No domain",
      },
      {
        value: "Task:k1",
        label: "Finish module",
        group: "Tasks",
      },
      {
        value: "Resource:r1",
        label: "Docs site",
        group: "Resources",
      },
    ]);
  });

  test("groups topics by domain, sorted with No domain last and names sorted", () => {
    const options = buildConnectionOptions(
      [
        {
          id: "t1",
          name: "Zebra",
          domains: [{
            id: "d2",
            title: "Tooling",
          }],
        },
        {
          id: "t2",
          name: "Apple",
          domains: [{
            id: "d1",
            title: "Frontend",
          }],
        },
        {
          id: "t3",
          name: "Mango",
          domains: [],
        },
        {
          id: "t4",
          name: "Bravo",
          domains: [{
            id: "d1",
            title: "Frontend",
          }],
        },
      ],
      [],
      [],
    );
    expect(options).toEqual([
      {
        value: "Topic:t2",
        label: "Apple",
        group: "Topics · Frontend",
      },
      {
        value: "Topic:t4",
        label: "Bravo",
        group: "Topics · Frontend",
      },
      {
        value: "Topic:t1",
        label: "Zebra",
        group: "Topics · Tooling",
      },
      {
        value: "Topic:t3",
        label: "Mango",
        group: "Topics · No domain",
      },
    ]);
  });

  test("lists a multi-domain topic once under each of its domains", () => {
    const options = buildConnectionOptions(
      [{
        id: "t1",
        name: "React",
        domains: [
          {
            id: "d1",
            title: "Frontend",
          },
          {
            id: "d2",
            title: "Tooling",
          },
        ],
      }],
      [],
      [],
    );
    expect(options).toEqual([
      {
        value: "Topic:t1",
        label: "React",
        group: "Topics · Frontend",
      },
      {
        value: "Topic:t1",
        label: "React",
        group: "Topics · Tooling",
      },
    ]);
  });

  test("handles missing lists", () => {
    expect(buildConnectionOptions(null, undefined, [])).toEqual([]);
  });
});
