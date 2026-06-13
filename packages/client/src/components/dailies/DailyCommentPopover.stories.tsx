import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DailyCommentPopover } from "./DailyCommentPopover";

import { makeDaily } from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { getTodayKey } from "@/utils";

const meta = {
  component: DailyCommentPopover,
  decorators: [
    Story => (
      <QueryStub>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof DailyCommentPopover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithNote: Story = {
  args: {
    daily: makeDaily({
      completions: [
        {
          date: getTodayKey(),
          status: "goal",
          note: "Great session",
        },
      ],
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: /view comment/i,
      }),
    ).toBeInTheDocument();
  },
};

export const NoNote: Story = {
  args: {
    daily: makeDaily({
      completions: [],
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: /add comment/i,
      }),
    ).toBeInTheDocument();
  },
};
