import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { QuickAddTodoistDialog } from "./QuickAddTodoistDialog";

import { routerQueryDecorator } from "@/test-utils/quickAddStoryHelpers";
import { seededSettingsClient } from "@/test-utils/settingsFixtures";

const meta: Meta<typeof QuickAddTodoistDialog> = {
  component: QuickAddTodoistDialog,
  args: {
    open: true,
    onOpenChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// With Todoist configured the create-task form is shown. Dialog portals to body.
export const Configured: Story = {
  decorators: [
    routerQueryDecorator(seededSettingsClient({
      todoistConfigured: true,
    })),
  ],
};

// Without a Todoist key the dialog points the user to Settings.
export const Unconfigured: Story = {
  decorators: [routerQueryDecorator(seededSettingsClient())],
};
