import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ActionableSentence } from "./ActionableSentence";

const meta = {
  component: ActionableSentence,
} satisfies Meta<typeof ActionableSentence>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithAffixes: Story = {
  args: {
    prependText: "Read",
    name: "Structure and Interpretation of Computer Programs",
    appendText: "for 30 minutes",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Structure and Interpretation of Computer Programs"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Read")).toBeInTheDocument();
    await expect(canvas.getByText("for 30 minutes")).toBeInTheDocument();
  },
};

export const NameOnly: Story = {
  args: {
    name: "Morning reading",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Morning reading")).toBeInTheDocument();
  },
};
