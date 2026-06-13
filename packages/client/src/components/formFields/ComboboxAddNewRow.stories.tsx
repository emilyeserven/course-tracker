import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { ComboboxAddNewRow } from "./ComboboxAddNewRow";

const meta: Meta<typeof ComboboxAddNewRow> = {
  component: ComboboxAddNewRow,
  args: {
    itemLabel: "provider",
    trimmedInput: "Udemy",
    onOpenCreate: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("provider", {
      exact: false,
    })).toBeInTheDocument();
    await expect(canvas.getByText("Udemy")).toBeInTheDocument();
  },
};

/** The row commits on `mousedown` (so it fires before the combobox blur). */
export const OpensCreate: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: canvas.getByRole("button"),
    });
    await expect(args.onOpenCreate).toHaveBeenCalledOnce();
  },
};
