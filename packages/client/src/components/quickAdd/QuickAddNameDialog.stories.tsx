import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { QuickAddNameDialog } from "./QuickAddNameDialog";

import { expectDialogFields } from "@/test-utils/quickAddStoryHelpers";

const meta: Meta<typeof QuickAddNameDialog> = {
  component: QuickAddNameDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    title: "Add Resource",
    entity: "resource",
    placeholder: "Resource name",
    isPending: false,
    onSubmit: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The Radix dialog content portals to document.body, so assert against it.
export const Default: Story = {
  play: expectDialogFields({
    title: "Add Resource",
    fields: ["Name"],
  }),
};

// Submitting calls onSubmit with the trimmed, non-empty name.
export const Submits: Story = {
  play: async ({
    args,
  }) => {
    const body = within(document.body);
    await userEvent.type(await body.findByLabelText("Name"), "  My Course  ");
    await userEvent.click(body.getByRole("button", {
      name: "Create",
    }));
    await expect(args.onSubmit).toHaveBeenCalledWith("My Course");
  },
};

// While the create mutation is in flight the submit button is disabled.
export const Pending: Story = {
  args: {
    isPending: true,
  },
  play: async () => {
    const body = within(document.body);
    await expect(
      await body.findByRole("button", {
        name: "Create",
      }),
    ).toBeDisabled();
  },
};
