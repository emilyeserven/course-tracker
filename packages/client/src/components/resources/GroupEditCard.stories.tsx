import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { GroupEditCard } from "./GroupEditCard";
import { emptyGroupDraft, groupToDraft } from "./moduleDrafts";

import {
  makeModuleGroup,
  makeTagGroups,
} from "@/test-utils/resourceModulesFixtures";

const meta: Meta<typeof GroupEditCard> = {
  component: GroupEditCard,
  args: {
    draft: emptyGroupDraft(),
    hasEnumeratedModules: false,
    tagGroups: makeTagGroups(),
    isNew: true,
    isSaving: false,
    onSave: fn(),
    onCancel: fn(),
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

export const New: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Group Name")).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText("e.g. Section 1: Fundamentals"),
    ).toBeInTheDocument();
  },
};

export const Editing: Story = {
  args: {
    draft: groupToDraft(
      makeModuleGroup({
        name: "Section 2: Advanced",
        totalCount: 8,
        completedCount: 3,
      }),
    ),
    isNew: false,
    onDelete: fn(),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByDisplayValue("Section 2: Advanced"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: "Remove Group",
      }),
    ).toBeInTheDocument();
  },
};
