import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

import { RouterStub } from "@/test-utils/RouterStub";

// `useBlocker` needs router context. The AlertDialog only appears when a
// navigation is actually blocked, which can't happen in the context-only
// RouterStub (navigation is a no-op), so this is a mount smoke test: the
// component renders without throwing and shows no dialog.
const meta: Meta<typeof UnsavedChangesDialog> = {
  component: UnsavedChangesDialog,
  args: {
    shouldBlockFn: fn(() => false),
  },
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

export const Idle: Story = {
  play: async () => {
    const body = within(document.body);
    // No blocked navigation → the dialog is not shown.
    await expect(body.queryByText("Unsaved changes")).not.toBeInTheDocument();
  },
};
