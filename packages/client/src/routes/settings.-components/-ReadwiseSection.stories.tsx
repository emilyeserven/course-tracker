import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ReadwiseSection } from "./-ReadwiseSection";

import { seededSettingsClient } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const meta = {
  component: ReadwiseSection,
  decorators: [queryStubDecorator(seededSettingsClient)],
} satisfies Meta<typeof ReadwiseSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The Readwise integration wraps IntegrationKeySection with its preset copy.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: "Readwise",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", {
        name: /readwise\.io\/access_token/i,
      }),
    ).toBeInTheDocument();
  },
};
