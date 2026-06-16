import { describe, expect, test } from "vitest";

import type { ResourceFormValues } from "./-buildResourcePayload.ts";

import { buildResourcePayload } from "./-buildResourcePayload.ts";

const baseValues: ResourceFormValues = {
  name: "Intro to TypeScript",
  type: "website",
  description: "A course",
  url: "https://example.com",
  status: "active",
  progressCurrent: 3,
  progressTotal: 10,
  tracksProgress: true,
  cost: 49.99,
  dateExpires: new Date("2026-12-31T00:00:00.000Z"),
  topicId: "topic-1",
  courseProviderId: "provider-1",
  providerIsSelf: false,
  easeOfStarting: "high",
  timeNeeded: "medium",
  interactivity: "low",
  tagIds: ["tag-1", "tag-2"],
};

describe("buildResourcePayload", () => {
  test("maps a fully-populated form onto the API payload", () => {
    const payload = buildResourcePayload(baseValues, {
      isCostFromPlatform: false,
    });

    expect(payload).toEqual({
      name: "Intro to TypeScript",
      type: "website",
      description: "A course",
      url: "https://example.com",
      status: "active",
      progressCurrent: 3,
      progressTotal: 10,
      tracksProgress: true,
      cost: "49.99",
      isCostFromPlatform: false,
      dateExpires: "2026-12-31",
      isExpires: true,
      topicId: "topic-1",
      courseProviderId: "provider-1",
      providerIsSelf: false,
      easeOfStarting: "high",
      timeNeeded: "medium",
      interactivity: "low",
      tagIds: ["tag-1", "tag-2"],
    });
  });

  test("coalesces empty strings and nullish numbers to null/0", () => {
    const payload = buildResourcePayload(
      {
        ...baseValues,
        description: "",
        url: "",
        progressCurrent: null,
        progressTotal: null,
        cost: null,
        dateExpires: null,
        topicId: "",
        courseProviderId: "",
        easeOfStarting: "",
        timeNeeded: "",
        interactivity: "",
      },
      {
        isCostFromPlatform: false,
      },
    );

    expect(payload.description).toBeNull();
    expect(payload.url).toBeNull();
    expect(payload.progressCurrent).toBe(0);
    expect(payload.progressTotal).toBe(0);
    expect(payload.cost).toBeNull();
    expect(payload.dateExpires).toBeNull();
    expect(payload.isExpires).toBe(false);
    expect(payload.topicId).toBeNull();
    expect(payload.courseProviderId).toBeNull();
    expect(payload.easeOfStarting).toBeNull();
    expect(payload.timeNeeded).toBeNull();
    expect(payload.interactivity).toBeNull();
  });

  test("ignores the entered cost when it comes from the platform", () => {
    const payload = buildResourcePayload(baseValues, {
      isCostFromPlatform: true,
    });

    expect(payload.cost).toBeNull();
    expect(payload.isCostFromPlatform).toBe(true);
  });
});
