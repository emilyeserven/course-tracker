import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { NewRoutineForm } from "./-NewRoutineForm";

import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof NewRoutineForm> = {
  component: NewRoutineForm,
  args: {
    search: {},
    onCreated: fn(() => Promise.resolve()),
    onCancel: fn(),
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

// The empty create form: name + type, with create/cancel actions. We don't
// submit (that would call createRoutine).
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", {
        name: /new routine/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Routine Name")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /create routine/i,
      }),
    ).toBeInTheDocument();
  },
};

// Cancel fires the caller's onCancel handler.
export const CancelClickable: Story = {
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = within(canvasElement);
    const cancel = await canvas.findByRole("button", {
      name: /cancel/i,
    });
    await userEvent.click(cancel);
    await expect(args.onCancel).toHaveBeenCalled();
  },
};
