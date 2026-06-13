import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { LlmEditTab } from "./-LlmEditTab";

import {
  makeBlips,
  makeQuadrants,
  makeRings,
  makeTopics,
} from "@/test-utils/radarFixtures";

const meta: Meta<typeof LlmEditTab> = {
  component: LlmEditTab,
  args: {
    allConfigPersisted: true,
    domainId: "domain-1",
    domainTitle: "Backend Platform",
    domainDescription:
      "Services, infra, and tooling owned by the platform team.",
    domainTopics: [],
    excludedTopics: [],
    withinScopeDescription: "Anything the platform team operates.",
    outOfScopeDescription: "Frontend frameworks.",
    withinScopeTopicNames: ["Kubernetes"],
    outOfScopeTopicNames: ["React"],
    quadrants: makeQuadrants(),
    rings: makeRings(),
    topics: makeTopics(),
    existingBlips: makeBlips(4),
    onComplete: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const NotConfigured: Story = {
  args: {
    allConfigPersisted: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/Save your slices and rings/),
    ).toBeInTheDocument();
  },
};
