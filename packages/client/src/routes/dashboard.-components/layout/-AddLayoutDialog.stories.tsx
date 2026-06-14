import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, screen, userEvent } from "storybook/test";

import { AddLayoutDialog } from "./-AddLayoutDialog";

const meta: Meta<typeof AddLayoutDialog> = {
  component: AddLayoutDialog,
  args: {
    open: true,
    savedPresets: [],
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The add-tab dialog: a starting-layout select + a (preset-seeded) name field.
export const Open: Story = {
  play: async ({
    args,
  }) => {
    await expect(await screen.findByText("Add layout")).toBeInTheDocument();
    const name = await screen.findByPlaceholderText("Layout name");
    await userEvent.clear(name);
    await userEvent.type(name, "My layout");
    await userEvent.click(
      screen.getByRole("button", {
        name: "Add",
      }),
    );
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};

// Closed: nothing rendered.
export const Closed: Story = {
  args: {
    open: false,
  },
  play: async () => {
    await expect(screen.queryByText("Add layout")).not.toBeInTheDocument();
  },
};
