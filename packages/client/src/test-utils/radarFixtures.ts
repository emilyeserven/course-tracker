import type { TopicForTopicsPage } from "@emstack/types";

/**
 * Shared topic-row factory for list stories. Kept here so the resources and
 * topics list stories build topic rows the same way.
 */

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
