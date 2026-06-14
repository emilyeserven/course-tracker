import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { QuickAddProviderDialog } from "./QuickAddProviderDialog";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof QuickAddProviderDialog> = {
  component: QuickAddProviderDialog,
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
    await expect(await body.findByText("Add Provider")).toBeInTheDocument();
    await expect(await body.findByLabelText("Name")).toBeInTheDocument();
    await expect(await body.findByLabelText("URL")).toBeInTheDocument();
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
