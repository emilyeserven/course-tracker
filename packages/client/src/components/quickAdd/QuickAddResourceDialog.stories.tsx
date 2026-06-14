import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { QuickAddResourceDialog } from "./QuickAddResourceDialog";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof QuickAddResourceDialog> = {
  component: QuickAddResourceDialog,
  args: {
    open: true,
    onOpenChange: fn(),
  },
  // useMutation + useNavigate → QueryStub + RouterStub.
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Dialog content portals to document.body.
export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Add Resource")).toBeInTheDocument();
    await expect(await body.findByLabelText("Name")).toBeInTheDocument();
  },
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
  play: async ({
    args,
  }) => {
    const body = within(document.body);
    await userEvent.click(await body.findByRole("button", {
      name: "Cancel",
    }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
