import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { QuickAddReadwiseDialog } from "./QuickAddReadwiseDialog";

import { routerQueryDecorator } from "@/test-utils/quickAddStoryHelpers";
import { seededSettingsClient } from "@/test-utils/settingsFixtures";

const meta: Meta<typeof QuickAddReadwiseDialog> = {
  component: QuickAddReadwiseDialog,
  args: {
    open: true,
    onOpenChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// With Readwise configured the save form is shown. Dialog portals to body.
export const Configured: Story = {
  decorators: [
    routerQueryDecorator(seededSettingsClient({
      readwiseConfigured: true,
    })),
  ],
};

// Without a Readwise key the dialog points the user to Settings.
export const Unconfigured: Story = {
  decorators: [routerQueryDecorator(seededSettingsClient())],
};
