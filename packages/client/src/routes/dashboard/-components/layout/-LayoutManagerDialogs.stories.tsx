import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, screen } from "storybook/test";

import { LayoutManagerDialogs } from "./-LayoutManagerDialogs";

const layout = {
  id: "dl-1",
  name: "Morning focus",
  position: 0,
  tiles: [],
  isTemplate: false,
};

const meta: Meta<typeof LayoutManagerDialogs> = {
  component: LayoutManagerDialogs,
  args: {
    renameTarget: null,
    isRenaming: false,
    closeRename: fn(),
    submitRename: fn(),
    saveAsTarget: null,
    isSavingPreset: false,
    closeSaveAs: fn(),
    submitSaveAs: fn(),
    deleteTarget: null,
    closeDelete: fn(),
    confirmDelete: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Rename: Story = {
  args: {
    renameTarget: layout,
  },
  play: async () => {
    await expect(await screen.findByText("Rename layout")).toBeInTheDocument();
  },
};

export const SaveAs: Story = {
  args: {
    saveAsTarget: layout,
  },
  play: async () => {
    await expect(await screen.findByText("Save as layout")).toBeInTheDocument();
  },
};

export const ConfirmDelete: Story = {
  args: {
    deleteTarget: layout,
  },
  play: async () => {
    await expect(await screen.findByText("Delete layout?")).toBeInTheDocument();
    await expect(screen.getByText(/Morning focus/)).toBeInTheDocument();
  },
};
