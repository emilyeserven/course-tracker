import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { QuickAddResourceDialog } from "./QuickAddResourceDialog";

import {
  expectCancelClosesDialog,
  expectDialogFields,
  routerQueryDecorator,
} from "@/test-utils/quickAddStoryHelpers";

const meta: Meta<typeof QuickAddResourceDialog> = {
  component: QuickAddResourceDialog,
  args: {
    open: true,
    onOpenChange: fn(),
  },
  // useMutation + useNavigate → QueryStub + RouterStub.
  decorators: [routerQueryDecorator()],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Dialog content portals to document.body.
export const Default: Story = {
  play: expectDialogFields({
    title: "Add Resource",
    fields: ["Name"],
  }),
};

// initialName seeds the name input when the dialog opens.
export const WithInitialName: Story = {
  args: {
    initialName: "Structured Query Language",
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByLabelText("Name")).toHaveValue(
      "Structured Query Language",
    );
  },
};

// Cancel closes the dialog via onOpenChange(false).
export const Cancel: Story = {
  play: expectCancelClosesDialog,
};
