import type { Meta, StoryObj } from "@storybook/react-vite";

import { within, expect } from "@storybook/test";

import { Text } from "./Text";

const meta = {
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "text",
  },
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = within(canvasElement);

    const component = canvas.getByTestId("test-component-root");

    await expect(component).toBeInTheDocument();

    await expect(component).toHaveTextContent(args.text);
  },
};
