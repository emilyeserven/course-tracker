import type { InteractionDraft } from "@/hooks/useInteractionsLog";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { InteractionEditCard } from "./-InteractionEditCard";

import { makeModule, makeModuleGroup } from "@/test-utils/resourceModulesFixtures";

const emptyDraft: InteractionDraft = {
  id: "__new__",
  date: "2026-06-14",
  progress: "started",
  note: "",
  difficulty: "",
  understanding: "",
  moduleGroupId: "",
  moduleId: "",
};

const meta: Meta<typeof InteractionEditCard> = {
  component: InteractionEditCard,
  args: {
    draft: emptyDraft,
    moduleGroups: [],
    modules: [],
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

// The create form: no delete action, no module/group targets.
export const New: Story = {
  args: {
    isNew: true,
  },
};

// Editing an existing interaction that targets a specific group, with the
// module/group selectors shown and a delete action available.
export const EditingWithTargets: Story = {
  args: {
    draft: {
      ...emptyDraft,
      id: "i1",
      progress: "complete",
      note: "Worked through the exercises.",
      difficulty: "medium",
      understanding: "comfortable",
      moduleGroupId: "g1",
    },
    moduleGroups: [makeModuleGroup({
      id: "g1",
      name: "Fundamentals",
    })],
    modules: [makeModule({
      id: "m1",
      name: "Variables",
    })],
    onDelete: fn(),
  },
};
