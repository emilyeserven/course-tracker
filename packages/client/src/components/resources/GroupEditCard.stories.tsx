import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { GroupEditCard } from "./GroupEditCard";
import { emptyGroupDraft, groupToDraft } from "./moduleDrafts";

import {
  makeModuleGroup,
  makeTagGroups,
} from "@/test-utils/resourceModulesFixtures";
import { constrainedStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

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
  decorators: [constrainedStoryDecorator("max-w-xl")],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const New: Story = {
  play: smokePlay([
    {
      text: "Group Name",
    },
    {
      placeholder: "e.g. Section 1: Fundamentals",
    },
  ]),
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
  play: smokePlay([
    {
      displayValue: "Section 2: Advanced",
    },
    {
      role: "button",
      name: "Remove Group",
    },
  ]),
};
