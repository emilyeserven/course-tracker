import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { EditForm } from "./EditForm";

import { Button } from "@/components/ui/button";

const meta: Meta<typeof EditForm> = {
  component: EditForm,
  args: {
    onSubmit: fn(),
    className: "flex flex-col gap-3",
    children: (
      <>
        <input
          name="name"
          placeholder="Name"
          className="rounded-md border px-2 py-1"
        />
        <Button type="submit">Save</Button>
      </>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("Name")).toBeInTheDocument();
  },
};

// Submitting calls onSubmit after preventDefault (no page reload).
export const SubmitCallsHandler: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Save",
    }));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
