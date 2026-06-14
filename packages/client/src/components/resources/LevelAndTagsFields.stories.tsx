import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { LevelAndTagsFields } from "./LevelAndTagsFields";

import { makeTagGroups } from "@/test-utils/resourceModulesFixtures";

const meta: Meta<typeof LevelAndTagsFields> = {
  component: LevelAndTagsFields,
  args: {
    draft: {
      easeOfStarting: "",
      timeNeeded: "",
      interactivity: "",
      tagIds: [],
    },
    tagGroups: makeTagGroups(),
    onChange: fn(),
  },
  decorators: [
    Story => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Tags")).toBeInTheDocument();
    await expect(canvas.getByText("Ease of Starting")).toBeInTheDocument();
  },
};

export const Prefilled: Story = {
  args: {
    draft: {
      easeOfStarting: "low",
      timeNeeded: "medium",
      interactivity: "high",
      tagIds: ["tag-1-a"],
    },
  },
};
