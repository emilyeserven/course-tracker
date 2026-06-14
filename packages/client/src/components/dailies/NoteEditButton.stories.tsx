import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { NoteEditButton } from "./NoteEditButton";

const meta: Meta<typeof NoteEditButton> = {
  component: NoteEditButton,
  args: {
    onSave: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Has an existing note (button is always visible). Popover opens on click and
// portals to document.body — render-only smoke test.
export const WithNote: Story = {
  args: {
    initialNote: "Finished chapter 3",
  },
};

// No note yet (button is hover/focus-revealed within its group).
export const Empty: Story = {
  args: {
    initialNote: null,
  },
};
