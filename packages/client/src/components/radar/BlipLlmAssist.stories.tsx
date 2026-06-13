import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BlipLlmAssist } from "./BlipLlmAssist";

import {
  makeBlips,
  makeQuadrants,
  makeRings,
  makeTopics,
} from "@/test-utils/radarFixtures";

const meta: Meta<typeof BlipLlmAssist> = {
  component: BlipLlmAssist,
  args: {
    domainId: "domain-1",
    domainTitle: "Backend Platform",
    domainDescription: "Services, infra, and tooling owned by the platform team.",
    domainTopics: [],
    excludedTopics: [],
    withinScopeDescription: "Anything the platform team operates.",
    outOfScopeDescription: "Frontend frameworks.",
    withinScopeTopicNames: ["Kubernetes", "Terraform"],
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

// Render-only smoke story — the setup view renders the prompt builder and a
// JSON input. (Story execution itself fails if the component throws on render.)
export const Setup: Story = {};
