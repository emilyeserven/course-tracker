import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DailyStatusModal } from "./DailyStatusModal";

import { makeDaily } from "@/test-utils/dailiesFixtures";

const meta: Meta<typeof DailyStatusModal> = {
  component: DailyStatusModal,
  args: {
    open: true,
    onOpenChange: fn(),
    onChange: fn(),
    currentStatus: "goal",
    daily: makeDaily({
      criteria: {
        goal: "30 min practice",
        touched: "Opened the book",
      },
    }),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Render-only smoke test: the dialog content portals to document.body.
export const Open: Story = {};

// Assert a criteria label is rendered. Dialog content portals to body, so we
// query within(document.body) rather than canvasElement.
export const ShowsCriteria: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("30 min practice")).toBeInTheDocument();
  },
};
