import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { OnboardingEmptyState } from "./OnboardingEmptyState";

import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof OnboardingEmptyState> = {
  component: OnboardingEmptyState,
  args: {
    message: "No resources yet!",
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("No resources yet!"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", {
        name: /Go to onboarding/,
      }),
    ).toBeInTheDocument();
  },
};
