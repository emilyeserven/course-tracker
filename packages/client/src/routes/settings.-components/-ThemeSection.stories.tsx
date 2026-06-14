import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ThemeSection } from "./-ThemeSection";

import { ThemeProvider } from "@/context/ThemeProvider";

const meta = {
  component: ThemeSection,
  decorators: [
    Story => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The single light/dark toggle button (label depends on the active theme).
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: /set to (dark|light) mode/i,
      }),
    ).toBeInTheDocument();
  },
};
