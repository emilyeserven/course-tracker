import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionableSentencePreview } from "./-ActionableSentencePreview";

const meta: Meta<typeof ActionableSentencePreview> = {
  component: ActionableSentencePreview,
  args: {
    preview: "Review Spanish flashcards for 10 minutes",
  },
  decorators: [
    Story => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
