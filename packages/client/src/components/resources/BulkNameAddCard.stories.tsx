import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { BulkNameAddCard } from "./BulkNameAddCard";

import { constrainedStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta: Meta<typeof BulkNameAddCard> = {
  component: BulkNameAddCard,
  args: {
    itemLabel: "Module",
    isSaving: false,
    onSave: fn(),
    onCancel: fn(),
  },
  decorators: [constrainedStoryDecorator("max-w-xl")],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: smokePlay([
    {
      text: "Module names — one per line",
    },
    {
      text: "No modules yet",
    },
  ]),
};

// Typing several lines enables the Add button and reflects the parsed count;
// submitting fires onSave with the trimmed, blank-stripped names in order.
export const AddsTypedNames: Story = {
  play: async ({
    args,
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "Intro\n\n  Setup  \nWrap up");

    const addButton = canvas.getByRole("button", {
      name: /Add 3/,
    });
    await expect(addButton).toBeEnabled();

    await userEvent.click(addButton);
    await expect(args.onSave).toHaveBeenCalledWith(["Intro", "Setup", "Wrap up"]);
  },
};

// The same card relabelled for bulk-adding module groups.
export const Groups: Story = {
  args: {
    itemLabel: "Group",
  },
  play: smokePlay([
    {
      text: "Group names — one per line",
    },
    {
      text: "No groups yet",
    },
  ]),
};

export const Saving: Story = {
  args: {
    isSaving: true,
  },
};
