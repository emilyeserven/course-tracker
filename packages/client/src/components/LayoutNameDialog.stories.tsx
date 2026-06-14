import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { LayoutNameDialog } from "./LayoutNameDialog";

// Controlled Dialog: render with `open: true`. The content portals to
// document.body, so assertions query there.
const meta: Meta<typeof LayoutNameDialog> = {
  component: LayoutNameDialog,
  args: {
    open: true,
    title: "New layout",
    onOpenChange: fn(),
    onSubmit: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// An empty name keeps Save disabled.
export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("New layout")).toBeInTheDocument();
    await expect(body.getByRole("button", {
      name: "Save",
    })).toBeDisabled();
  },
};

// Typing a name enables Save and submits the trimmed value.
export const TypeAndSubmit: Story = {
  play: async ({
    args,
  }) => {
    const body = within(document.body);
    const input = await body.findByPlaceholderText("Layout name");
    await userEvent.type(input, "Focus mode");
    const save = body.getByRole("button", {
      name: "Save",
    });
    await expect(save).toBeEnabled();
    await userEvent.click(save);
    await expect(args.onSubmit).toHaveBeenCalledWith("Focus mode");
  },
};

// Renaming prefills the field and uses a custom submit label.
export const Rename: Story = {
  args: {
    title: "Rename layout",
    initialName: "Morning routine",
    submitLabel: "Rename",
  },
  play: async () => {
    const body = within(document.body);
    await expect(
      await body.findByDisplayValue("Morning routine"),
    ).toBeInTheDocument();
    await expect(body.getByRole("button", {
      name: "Rename",
    })).toBeEnabled();
  },
};
