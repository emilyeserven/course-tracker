import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DailyProgressCell } from "./DailyProgressCell";

import { makeDaily } from "@/test-utils/dailiesFixtures";

const meta = {
  component: DailyProgressCell,
} satisfies Meta<typeof DailyProgressCell>;

export default meta;

type Story = StoryObj<typeof meta>;

// Task path: progress derived from todos.
export const TaskProgress: Story = {
  args: {
    daily: makeDaily({
      task: {
        id: "t1",
        name: "Build the widget",
        progress: {
          todosTotal: 3,
          todosComplete: 2,
        },
      },
    }),
  },
};

// No linked task: falls back to the infinity ("Daily Drills") icon.
export const DailyDrills: Story = {
  args: {
    daily: makeDaily({}),
  },
};

// Bookmark path: reading progress from Simple Bookmarks drives the ring.
export const BookmarkProgress: Story = {
  args: {
    daily: makeDaily({
      bookmarkProgress: {
        current: 45,
        total: 320,
        title: "Kubernetes for Developers",
      },
    }),
  },
};

// A bookmark with no real progress (zero total) is not a ring: it falls
// through to the infinity ("Daily Drills") icon, never an empty progress bar.
export const BookmarkNoProgress: Story = {
  args: {
    daily: makeDaily({
      bookmarkProgress: {
        current: 0,
        total: 0,
        title: "Untracked Bookmark",
      },
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // No reading-progress ring — the bookmark branch is skipped for a zero total.
    await expect(
      canvas.queryByRole("button", {
        name: /bookmark progress/i,
      }),
    ).toBeNull();
  },
};

// Bookmark progress takes precedence over task to-do progress.
export const BookmarkOverTask: Story = {
  args: {
    daily: makeDaily({
      task: {
        id: "t1",
        name: "Build the widget",
        progress: {
          todosTotal: 3,
          todosComplete: 2,
        },
      },
      bookmarkProgress: {
        current: 10,
        total: 40,
        title: "Practical IoT Hacking",
      },
    }),
  },
};
