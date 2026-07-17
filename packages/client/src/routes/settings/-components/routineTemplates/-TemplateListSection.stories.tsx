import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TemplateListSection } from "./-TemplateListSection";

import { smokeText } from "@/test-utils/storyPlay";

const templates = [
  {
    id: "t-1",
    label: "Weekday drills",
  },
  {
    id: "t-2",
    label: "Weekend review",
  },
];

const meta: Meta<typeof TemplateListSection> = {
  component: TemplateListSection,
  args: {
    title: "Routine Templates",
    description: "Prefill options for the Weekly Schedule Quick Fill.",
    templates,
    isPending: false,
    renderMeta: () => null,
    onNew: fn(),
    onEdit: fn(),
    onDelete: fn(),
    isDeleting: false,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Populated: Story = {
  play: smokeText("Routine Templates", "Weekday drills", "Weekend review"),
};

export const Empty: Story = {
  args: {
    templates: [],
  },
  play: smokeText(/No templates yet/),
};

export const Loading: Story = {
  args: {
    templates: [],
    isPending: true,
  },
  play: smokeText("Loading..."),
};
