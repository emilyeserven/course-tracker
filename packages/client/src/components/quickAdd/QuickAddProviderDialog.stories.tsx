import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { QuickAddProviderDialog } from "./QuickAddProviderDialog";

import {
  expectCancelClosesDialog,
  expectDialogFields,
  routerQueryDecorator,
} from "@/test-utils/quickAddStoryHelpers";

const meta: Meta<typeof QuickAddProviderDialog> = {
  component: QuickAddProviderDialog,
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
    title: "Add Provider",
    fields: ["Name", "URL"],
  }),
};

// Cancel closes the dialog via onOpenChange(false).
export const Cancel: Story = {
  play: expectCancelClosesDialog,
};

// Create stays disabled until both Name and URL are filled.
export const EnablesOnFill: Story = {
  play: async () => {
    const body = within(document.body);
    const create = await body.findByRole("button", {
      name: "Create",
    });
    await expect(create).toBeDisabled();
    await userEvent.type(await body.findByLabelText("Name"), "Acme Learning");
    await userEvent.type(
      await body.findByLabelText("URL"),
      "https://example.com",
    );
    await expect(create).toBeEnabled();
  },
};
