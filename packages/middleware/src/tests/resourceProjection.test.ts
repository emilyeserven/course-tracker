import assert from "node:assert";
import { test } from "node:test";

import { mapResource } from "../utils/resourceProjection.ts";

// The row shape mapResource consumes (not exported from the module).
type Row = Parameters<typeof mapResource>[0];

// A fully-null/empty row: exercises every default arm in mapResource.
function emptyRow(overrides: Partial<Row> = {}): Row {
  return {
    id: "res-1",
    name: "Some Resource",
    type: null,
    description: null,
    url: null,
    dateExpires: null,
    progressCurrent: null,
    progressTotal: null,
    status: null,
    providerIsSelf: null,
    modulesAreExhaustive: null,
    tracksProgress: null,
    easeOfStarting: null,
    timeNeeded: null,
    interactivity: null,
    cost: null,
    modulesConfig: null,
    courseProvider: null,
    topicsToResources: [],
    resourceTags: [],
    ...overrides,
  };
}

test("mapResource fills defaults for a fully-null row", () => {
  const result = mapResource(emptyRow());

  assert.strictEqual(result.type, "website");
  assert.strictEqual(result.status, "inactive");
  assert.strictEqual(result.progressCurrent, 0);
  assert.strictEqual(result.progressTotal, 0);
  assert.strictEqual(result.providerIsSelf, false);
  assert.strictEqual(result.modulesAreExhaustive, false);
  assert.strictEqual(result.tracksProgress, true);
  assert.strictEqual(result.easeOfStarting, null);
  assert.strictEqual(result.timeNeeded, null);
  assert.strictEqual(result.interactivity, null);
  assert.strictEqual(result.modulesConfig, null);
  assert.strictEqual(result.provider, undefined);
  assert.deepStrictEqual(result.topics, []);
  assert.deepStrictEqual(result.tags, []);
  assert.deepStrictEqual(result.cost, {
    cost: null,
    isCostFromPlatform: false,
  });
});

test("mapResource passes through explicit values instead of defaults", () => {
  const result = mapResource(
    emptyRow({
      type: "book",
      description: "A book about things",
      url: "https://example.com",
      dateExpires: "2027-01-01",
      progressCurrent: 3,
      progressTotal: 10,
      status: "active",
      providerIsSelf: true,
      modulesAreExhaustive: true,
      tracksProgress: false,
      easeOfStarting: "low",
      timeNeeded: "medium",
      interactivity: "high",
    }),
  );

  assert.strictEqual(result.type, "book");
  assert.strictEqual(result.description, "A book about things");
  assert.strictEqual(result.url, "https://example.com");
  assert.strictEqual(result.dateExpires, "2027-01-01");
  assert.strictEqual(result.progressCurrent, 3);
  assert.strictEqual(result.progressTotal, 10);
  assert.strictEqual(result.status, "active");
  assert.strictEqual(result.providerIsSelf, true);
  assert.strictEqual(result.modulesAreExhaustive, true);
  assert.strictEqual(result.tracksProgress, false);
  assert.strictEqual(result.easeOfStarting, "low");
  assert.strictEqual(result.timeNeeded, "medium");
  assert.strictEqual(result.interactivity, "high");
});

test("mapResource treats falsy progress (0) as 0", () => {
  const result = mapResource(emptyRow({
    progressCurrent: 0,
    progressTotal: 0,
  }));
  assert.strictEqual(result.progressCurrent, 0);
  assert.strictEqual(result.progressTotal, 0);
});

test("mapResource projects the provider block from courseProvider", () => {
  const withProvider = mapResource(
    emptyRow({
      courseProvider: {
        id: "prov-1",
        name: "Frontend Masters",
        cost: null,
        isCourseFeesShared: null,
        resources: [],
      },
    }),
  );
  assert.deepStrictEqual(withProvider.provider, {
    id: "prov-1",
    name: "Frontend Masters",
  });

  // A provider with a null name projects to no provider block.
  const namelessProvider = mapResource(
    emptyRow({
      courseProvider: {
        id: "prov-2",
        name: null,
        cost: null,
        isCourseFeesShared: null,
        resources: [],
      },
    }),
  );
  assert.strictEqual(namelessProvider.provider, undefined);
});

test("mapResource derives platform-shared cost from the provider", () => {
  const result = mapResource(
    emptyRow({
      cost: "50",
      courseProvider: {
        id: "prov-1",
        name: "Platform",
        cost: "120",
        isCourseFeesShared: true,
        resources: [{}, {}, {}],
      },
    }),
  );
  // isCourseFeesShared === true → cost comes from the provider, split across its resources.
  assert.deepStrictEqual(result.cost, {
    cost: "120",
    isCostFromPlatform: true,
    splitBy: 3,
  });
});

test("mapResource uses the resource's own cost when fees are not shared", () => {
  const result = mapResource(emptyRow({
    cost: "50",
  }));
  assert.deepStrictEqual(result.cost, {
    cost: "50",
    isCostFromPlatform: false,
  });
});

test("mapResource flattens topic links and drops null-sided rows", () => {
  const result = mapResource(
    emptyRow({
      topicsToResources: [
        {
          topicId: "t1",
          resourceId: "res-1",
          topic: {
            id: "t1",
            name: "React",
          },
        },
        {
          topicId: "t2",
          resourceId: "res-1",
          topic: null,
        },
        {
          topicId: "t3",
          resourceId: "res-1",
          topic: {
            id: "t3",
            name: "TypeScript",
          },
        },
      ],
    }),
  );
  assert.deepStrictEqual(result.topics, [
    {
      id: "t1",
      name: "React",
    },
    {
      id: "t3",
      name: "TypeScript",
    },
  ]);
});

test("mapResource maps resourceTags down to their tag objects", () => {
  const tagA = {
    id: "tag-1",
    groupId: "g1",
    name: "frontend",
  };
  const tagB = {
    id: "tag-2",
    groupId: "g1",
    name: "advanced",
  };
  const result = mapResource(
    emptyRow({
      resourceTags: [{
        tag: tagA,
      }, {
        tag: tagB,
      }],
    }),
  );
  assert.deepStrictEqual(result.tags, [tagA, tagB]);
});
