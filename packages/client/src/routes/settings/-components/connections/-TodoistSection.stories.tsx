import type { Meta, StoryObj } from "@storybook/react-vite";

import { TodoistSection } from "./-TodoistSection";

import { seededSettingsClient } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const meta = {
  component: TodoistSection,
  decorators: [queryStubDecorator(seededSettingsClient)],
} satisfies Meta<typeof TodoistSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The Todoist integration wraps IntegrationKeySection with its preset copy.
export const Default: Story = {};
