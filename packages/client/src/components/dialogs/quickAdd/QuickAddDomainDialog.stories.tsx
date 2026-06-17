import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { QuickAddDomainDialog } from "./QuickAddDomainDialog";

import {
  expectCancelClosesDialog,
  expectDialogFields,
  routerQueryDecorator,
} from "@/test-utils/quickAddStoryHelpers";

const meta: Meta<typeof QuickAddDomainDialog> = {
  component: QuickAddDomainDialog,
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
    title: "Add Domain",
    fields: ["Name"],
  }),
};

// Cancel closes the dialog via onOpenChange(false).
export const Cancel: Story = {
  play: expectCancelClosesDialog,
};
