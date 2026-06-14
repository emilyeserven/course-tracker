import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { CriteriaTemplatesSection } from "./-CriteriaTemplatesSection";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeCriteriaTemplate } from "@/test-utils/templatesFixtures";

function clientWith(templates = [makeCriteriaTemplate()]) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(["dailyCriteriaTemplates"], templates);
  return client;
}

const meta = {
  component: CriteriaTemplatesSection,
  decorators: [
    Story => (
      <QueryStub client={clientWith()}>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof CriteriaTemplatesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// A saved criteria template with its goal preview.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: /status criteria templates/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Reading goals")).toBeInTheDocument();
  },
};

// The empty state prompts the user to create one.
export const Empty: Story = {
  decorators: [
    Story => (
      <QueryStub client={clientWith([])}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no templates yet/i)).toBeInTheDocument();
  },
};
