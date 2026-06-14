import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { NewRoutineForm } from "./-NewRoutineForm";

import { routerStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta: Meta<typeof NewRoutineForm> = {
  component: NewRoutineForm,
  args: {
    search: {},
    onCreated: fn(() => Promise.resolve()),
    onCancel: fn(),
  },
  decorators: [routerStoryDecorator()],
};

export default meta;

type Story = StoryObj<typeof meta>;

// The empty create form: name + type, with create/cancel actions. We don't
// submit (that would call createRoutine).
export const Default: Story = {
  play: smokePlay([
    {
      role: "heading",
      name: /new routine/i,
    },
    {
      text: "Routine Name",
    },
    {
      role: "button",
      name: /create routine/i,
    },
  ]),
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
