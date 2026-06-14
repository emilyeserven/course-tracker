import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReadwiseSection } from "./-ReadwiseSection";

import { seededSettingsClient } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const meta = {
  component: ReadwiseSection,
  decorators: [queryStubDecorator(seededSettingsClient)],
} satisfies Meta<typeof ReadwiseSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The Readwise integration wraps IntegrationKeySection with its preset copy.
export const Default: Story = {};
