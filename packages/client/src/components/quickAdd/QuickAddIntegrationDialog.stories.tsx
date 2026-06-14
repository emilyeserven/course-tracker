import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { QuickAddIntegrationDialog } from "./QuickAddIntegrationDialog";

import { Input } from "@/components/input";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof QuickAddIntegrationDialog> = {
  component: QuickAddIntegrationDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    title: "Save to Readwise",
    providerName: "Readwise",
    isPending: false,
    canSubmit: true,
    submitLabel: "Save",
    onSubmit: fn(),
    children: (
      <div className="flex flex-col gap-1">
        <label
          htmlFor="quick-add-integration-url"
          className="text-xs font-medium text-muted-foreground"
        >
          URL
        </label>
        <Input id="quick-add-integration-url" />
      </div>
    ),
  },
  // The Settings link renders a TanStack <Link>, so the router context is needed.
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Configured → the form (children + submit footer) is shown. Dialog portals to body.
export const Configured: Story = {
  args: {
    configured: true,
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Save to Readwise")).toBeInTheDocument();
    await expect(await body.findByLabelText("URL")).toBeInTheDocument();
    await expect(
      await body.findByRole("button", {
        name: "Save",
      }),
    ).toBeInTheDocument();
  },
};

// Unconfigured → the dialog points the user to Settings instead of the form.
export const Unconfigured: Story = {
  args: {
    configured: false,
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Save to Readwise")).toBeInTheDocument();
    await expect(
      await body.findByText(/Add a Readwise API key in/),
    ).toBeInTheDocument();
    await expect(
      await body.findByRole("link", {
        name: "Settings",
      }),
    ).toBeInTheDocument();
  },
};
