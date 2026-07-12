import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { EntityError, EntityPending } from "./EntityStates";

// `EntityPending` is the meta component; `EntityError` is shown as a separate story.
const meta: Meta<typeof EntityPending> = {
  component: EntityPending,
  args: {
    entity: "tasks",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/loading your tasks/i)).toBeInTheDocument();
  },
};

export const Error: Story = {
  render: () => <EntityError entity="routines" />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/error loading your routines/i),
    ).toBeInTheDocument();
  },
};
