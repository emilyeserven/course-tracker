import type { ResolvedLlmEntry } from "@/components/radar/blipLlmReview";
import type { PositionedBlip } from "@/components/radar/radarLayout";
import type {
  Domain,
  DomainTopic,
  Radar,
  RadarBlip,
  RadarQuadrant,
  RadarRing,
  TopicForTopicsPage,
} from "@emstack/types";

/**
 * Mock-data factories for radar Storybook stories and tests. Kept here (rather
 * than duplicated per file) so every story builds blips/quadrants/rings the
 * same way.
 */

const QUADRANT_NAMES = ["Techniques", "Tools", "Platforms", "Languages"];
const RING_NAMES = ["Adopt", "Trial", "Assess", "Hold"];
const TOPIC_NAMES = [
  "Kubernetes",
  "Terraform",
  "Prometheus",
  "GraphQL",
  "Rust",
  "Vitest",
  "Playwright",
  "OpenTelemetry",
];

export function makeQuadrants(count = 4): RadarQuadrant[] {
  return Array.from(
    {
      length: count,
    },
    (_q, i) => ({
      id: `q${i}`,
      name: QUADRANT_NAMES[i] ?? `Quadrant ${i + 1}`,
      position: i,
    }),
  );
}

export function makeRings(count = 4): RadarRing[] {
  return Array.from(
    {
      length: count,
    },
    (_r, i) => ({
      id: `r${i}`,
      name: RING_NAMES[i] ?? `Ring ${i + 1}`,
      position: i,
    }),
  );
}

export function makeBlip(
  overrides: Partial<RadarBlip> & { id: string },
): RadarBlip {
  return {
    domainId: "domain-1",
    quadrantId: "q0",
    ringId: "r0",
    topicId: "topic-1",
    topicName: "Kubernetes",
    description: null,
    ...overrides,
  };
}

/** A spread of blips across the given quadrants/rings, with stable ids. */
export function makeBlips(
  count = 6,
  quadrants = makeQuadrants(),
  rings = makeRings(),
): RadarBlip[] {
  return Array.from(
    {
      length: count,
    },
    (_b, i) =>
      makeBlip({
        id: `blip-${i}`,
        topicId: `topic-${i}`,
        topicName: TOPIC_NAMES[i] ?? `Topic ${i + 1}`,
        quadrantId: quadrants[i % quadrants.length]?.id ?? null,
        ringId: rings[i % rings.length]?.id ?? null,
        description:
          i % 2 === 0 ? `Notes about ${TOPIC_NAMES[i] ?? "topic"}` : null,
      }),
  );
}

export function makeTopics(count = 6): TopicForTopicsPage[] {
  return Array.from(
    {
      length: count,
    },
    (_t, i) => ({
      id: `topic-${i}`,
      name: TOPIC_NAMES[i] ?? `Topic ${i + 1}`,
      description: `Description for ${TOPIC_NAMES[i] ?? `topic ${i + 1}`}`,
      resourceCount: i,
      taskCount: i % 3,
      dailyCount: i % 2,
    }),
  );
}

/** A fully-configured radar (quadrants, rings, and a spread of blips). */
export function makeRadar(overrides: Partial<Radar> = {}): Radar {
  const quadrants = overrides.quadrants ?? makeQuadrants();
  const rings = overrides.rings ?? makeRings();
  return {
    domainId: "domain-1",
    domainTitle: "Backend Platform",
    hasAdoptedSection: false,
    quadrants,
    rings,
    blips: makeBlips(6, quadrants, rings),
    ...overrides,
  };
}

/** A domain with scope topics, mirroring what the edit route passes its tabs. */
export function makeDomain(overrides: Partial<Domain> = {}): Domain {
  const asDomainTopics = (topics: TopicForTopicsPage[]): DomainTopic[] =>
    topics.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }));
  const topics = makeTopics();
  return {
    id: "domain-1",
    title: "Backend Platform",
    description: "Services, infra, and tooling owned by the platform team.",
    withinScopeDescription: "Anything the platform team operates.",
    outOfScopeDescription: "Frontend frameworks.",
    topics: asDomainTopics(topics.slice(0, 4)),
    withinScopeTopics: asDomainTopics(topics.slice(0, 2)),
    excludedTopics: [],
    ...overrides,
  };
}

/** Lays the blips out on a simple grid so SVG/legend stories have positions. */
export function makePositionedBlips(
  blips = makeBlips(),
  size = 400,
): PositionedBlip[] {
  const center = size / 2;
  return blips.map((blip, index) => ({
    blip,
    x: center + (index % 2 === 0 ? 1 : -1) * (40 + index * 12),
    y: center + (index % 3 === 0 ? 1 : -1) * (30 + index * 10),
    index: index + 1,
  }));
}

export function makeResolvedEntry(
  overrides: Partial<ResolvedLlmEntry> = {},
): ResolvedLlmEntry {
  return {
    topicName: "Kubernetes",
    matchedTopicId: "topic-0",
    willCreateTopic: false,
    quadrantInput: "Tools",
    ringInput: "Adopt",
    description: "Container orchestration",
    radarNote: "Standardized across teams",
    quadrantId: "q1",
    ringId: "r0",
    existingBlipId: null,
    existingQuadrantId: null,
    existingRingId: null,
    existingRadarNote: null,
    existingTopicDescription: null,
    topicCourseCount: 0,
    topicTaskCount: 0,
    topicDailyCount: 0,
    resolution: "create",
    deleteTopicOnRemove: false,
    editing: false,
    editDraft: null,
    selected: false,
    problems: [],
    ...overrides,
  };
}

/** Build an id→item lookup map (quadrantById / ringById / topicById). */
export function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map(item => [item.id, item]));
}
