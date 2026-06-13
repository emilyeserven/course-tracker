import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { emptyModuleDraft, moduleToDraft } from "./moduleDrafts";
import { ModuleEditCard } from "./ModuleEditCard";

import {
  makeModule,
  makeTagGroups,
} from "@/test-utils/resourceModulesFixtures";

const meta: Meta<typeof ModuleEditCard> = {
  component: ModuleEditCard,
  args: {
    draft: emptyModuleDraft(),
    tagGroups: makeTagGroups(),
    isNew: true,
    isComplete: false,
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
    await expect(canvas.getByText("Module Name")).toBeInTheDocument();
  },
};

export const Editing: Story = {
  args: {
    draft: moduleToDraft(
      makeModule({
        name: "Variables and Types",
        length: "45",
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
      canvas.getByDisplayValue("Variables and Types"),
    ).toBeInTheDocument();
  },
};

export const RangeLength: Story = {
  args: {
    draft: moduleToDraft(
      makeModule({
        name: "Deep Dive",
        length: "long",
      }),
    ),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Range",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};
