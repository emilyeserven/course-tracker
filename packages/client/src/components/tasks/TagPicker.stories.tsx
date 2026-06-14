import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { TagPicker } from "./TagPicker";

import { makeTagGroup } from "@/test-utils/tasksFixtures";

const tagGroups = [
  makeTagGroup(),
  makeTagGroup({
    id: "tag-group-2",
    name: "Area",
    tags: [
      {
        id: "tag-frontend",
        groupId: "tag-group-2",
        name: "Frontend",
      },
      {
        id: "tag-backend",
        groupId: "tag-group-2",
        name: "Backend",
      },
    ],
  }),
];

const meta: Meta<typeof TagPicker> = {
  component: TagPicker,
  args: {
    value: ["tag-easy", "tag-frontend"],
    onChange: fn(),
    tagGroups,
  },
  decorators: [
    Story => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

/** Selected tag ids render as named chips (the name is resolved from the groups). */
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Easy")).toBeInTheDocument();
    await expect(canvas.getByText("Frontend")).toBeInTheDocument();
  },
};

/** With nothing selected the input shows its placeholder. */
export const Empty: Story = {
  args: {
    value: [],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByPlaceholderText("Pick tags..."),
    ).toBeInTheDocument();
  },
};
