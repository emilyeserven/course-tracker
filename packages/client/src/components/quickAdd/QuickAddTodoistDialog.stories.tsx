import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { QuickAddTodoistDialog } from "./QuickAddTodoistDialog";

import {
  expectConfiguredForm,
  expectSettingsPrompt,
  routerQueryDecorator,
  seededSettingsClient,
} from "@/test-utils/quickAddStoryHelpers";

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
  play: expectConfiguredForm({
    title: "Add Todoist task",
    field: "Title",
    submit: "Add",
  }),
};

// Without a Todoist key the dialog points the user to Settings.
export const Unconfigured: Story = {
  decorators: [routerQueryDecorator(seededSettingsClient())],
  play: expectSettingsPrompt({
    title: "Add Todoist task",
    provider: "Todoist",
  }),
};
