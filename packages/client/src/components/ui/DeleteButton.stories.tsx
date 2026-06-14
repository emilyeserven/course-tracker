import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { DeleteButton } from "./DeleteButton";

const meta: Meta<typeof DeleteButton> = {
  component: DeleteButton,
  args: {
    children: "Delete topic",
    onClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/** Clicks the delete button and waits for the confirmation prompt to appear. */
async function openDeleteConfirm(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole("button", {
      name: /delete topic/i,
    }),
  );
  await canvas.findByText("Are you sure?");
  return canvas;
}

// Clicking the button swaps it for a confirmation prompt.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = await openDeleteConfirm(canvasElement);
    await expect(canvas.getByText("Are you sure?")).toBeInTheDocument();
  },
};

// Confirming triggers onClick (the first of the two icon buttons).
export const Confirms: Story = {
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = await openDeleteConfirm(canvasElement);
    const [confirm] = canvas.getAllByRole("button");
    await userEvent.click(confirm);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

// Cancelling restores the original button without calling onClick.
export const Cancels: Story = {
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = await openDeleteConfirm(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await userEvent.click(buttons[1]);
    await expect(canvas.queryByText("Are you sure?")).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /delete topic/i,
      }),
    ).toBeInTheDocument();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
