import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { EntityError, EntityPending } from "./EntityStates";

import { RouterStub } from "@/test-utils/RouterStub";

// `EntityPending` is the meta component; `EntityError` renders a router <Link>,
// so it's shown as a separate story wrapped in RouterStub.
const meta: Meta<typeof EntityPending> = {
  component: EntityPending,
  args: {
    entity: "courses",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/loading your courses/i)).toBeInTheDocument();
  },
};

// EntityError renders a TanStack <Link>, so it needs router context. RouterStub
// mounts async, so assert with findBy*.
export const Error: Story = {
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
  render: () => <EntityError entity="topics" />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/error loading your topics/i),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole("link", {
        name: "Onboarding Wizard",
      }),
    ).toBeInTheDocument();
  },
};
