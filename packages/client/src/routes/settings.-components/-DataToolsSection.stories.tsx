import type { Meta, StoryObj } from "@storybook/react-vite";

import { DataToolsSection } from "./-DataToolsSection";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

const meta = {
  component: DataToolsSection,
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof DataToolsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The two dev-data actions. We don't click them — they fetch + navigate.
export const Default: Story = {};
