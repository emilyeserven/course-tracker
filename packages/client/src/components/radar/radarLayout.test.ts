import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

import { describe, expect, test } from "vitest";

import { computeRingRadii, hashUnit, positionRadarBlips } from "./radarLayout";

function makeQuadrants(count: number): RadarQuadrant[] {
  return Array.from(
    {
      length: count,
    },
    (_q, i) => ({
      id: `q${i}`,
      name: `Quadrant ${i}`,
      position: i,
    }),
  );
}

function makeRings(count: number): RadarRing[] {
  return Array.from(
    {
      length: count,
    },
    (_r, i) => ({
      id: `r${i}`,
      name: `Ring ${i}`,
      position: i,
    }),
  );
}

function makeBlip(overrides: Partial<RadarBlip> & { id: string }): RadarBlip {
  return {
    domainId: "domain-1",
    quadrantId: "q0",
    ringId: "r0",
    topicId: "topic-1",
    topicName: "Topic",
    ...overrides,
  };
}

describe("hashUnit", () => {
  test("is deterministic for the same input", () => {
    expect(hashUnit("blip-1:angle")).toBe(hashUnit("blip-1:angle"));
    expect(hashUnit("blip-1:radius")).toBe(hashUnit("blip-1:radius"));
  });

  test("returns values in [0, 1)", () => {
    const inputs = ["", "a", "blip-1:angle", "blip-2:radius", "some-long-uuid-string"];
    inputs.forEach((input) => {
      const value = hashUnit(input);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });
  });
});

describe("positionRadarBlips", () => {
  const cx = 300;
  const cy = 300;
  const maxRadius = 276;
  const sortedQuadrants = makeQuadrants(4);
  const sortedRings = makeRings(3);
  const ringRadii = computeRingRadii(sortedRings.length, maxRadius);

  test("places a blip within its ring's radius band and its quadrant's angular range", () => {
    const blip = makeBlip({
      id: "blip-1",
      quadrantId: "q1",
      ringId: "r1",
    });
    const positioned = positionRadarBlips({
      blips: [blip],
      sortedQuadrants,
      sortedRings,
      ringRadii,
      adoptedRingIds: new Set<string>(),
      cx,
      cy,
    });
    expect(positioned).toHaveLength(1);
    const {
      x, y,
    } = positioned[0];

    // Ring band: r1 sits between ringRadii[0] and ringRadii[1].
    const distance = Math.hypot(x - cx, y - cy);
    expect(distance).toBeGreaterThan(ringRadii[0]);
    expect(distance).toBeLessThan(ringRadii[1]);

    // Quadrant 1 of 4 spans the angular range [0, PI/2) starting from the
    // top of the circle (-PI/2 + 1 * PI/2).
    const angle = Math.atan2(y - cy, x - cx);
    expect(angle).toBeGreaterThan(0);
    expect(angle).toBeLessThan(Math.PI / 2);
  });

  test("excludes ignored blips and adopted-ring blips from the main circle", () => {
    const blips = [
      makeBlip({
        id: "blip-normal",
      }),
      makeBlip({
        id: "blip-ignored",
        isIgnored: true,
      }),
      makeBlip({
        id: "blip-adopted",
        ringId: "ring-adopted",
      }),
    ];
    const positioned = positionRadarBlips({
      blips,
      sortedQuadrants,
      sortedRings,
      ringRadii,
      adoptedRingIds: new Set(["ring-adopted"]),
      cx,
      cy,
    });
    expect(positioned).toHaveLength(1);
    expect(positioned[0].blip.id).toBe("blip-normal");
    expect(positioned[0].index).toBe(1);
  });

  test("returns the same placements across calls", () => {
    const blips = [
      makeBlip({
        id: "blip-1",
        quadrantId: "q2",
        ringId: "r2",
      }),
      makeBlip({
        id: "blip-2",
        quadrantId: "q3",
        ringId: "r0",
      }),
    ];
    const args = {
      blips,
      sortedQuadrants,
      sortedRings,
      ringRadii,
      adoptedRingIds: new Set<string>(),
      cx,
      cy,
    };
    expect(positionRadarBlips(args)).toEqual(positionRadarBlips(args));
  });
});
