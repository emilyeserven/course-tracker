import type { DailyCriteriaTemplate } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DailyCriteriaTemplateEditModal } from "./DailyCriteriaTemplateEditModal";

const populatedTemplate: DailyCriteriaTemplate = {
  id: "tpl-1",
  label: "Book Rules",
  incomplete: "Did not open the book",
  touched: "Read a page or two",
  goal: "Read for 30 minutes",
  exceeded: "Read for over an hour",
  freeze: "Rest day",
};

const meta: Meta<typeof DailyCriteriaTemplateEditModal> = {
  component: DailyCriteriaTemplateEditModal,
  args: {
    open: true,
    onOpenChange: fn(),
    onSave: fn(),
    onDelete: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Editing an existing template. Dialog content portals to document.body, so
// this is a render-only smoke test.
export const Edit: Story = {
  args: {
    template: populatedTemplate,
    isNew: false,
  },
};

// Creating a new (empty) template.
export const New: Story = {
  args: {
    template: {
      id: "tpl-new",
      label: "",
      incomplete: "",
      touched: "",
      goal: "",
      exceeded: "",
      freeze: "",
    },
    isNew: true,
  },
};
