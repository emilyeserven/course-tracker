import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BookmarkPicker } from "./BookmarkPicker";

import { QueryStub } from "@/test-utils/QueryStub";

const meta: Meta<typeof BookmarkPicker> = {
  component: BookmarkPicker,
  args: {
    value: [],
    onChange: fn(),
  },
  decorators: [
    Story => (
      <QueryStub>
        <div className="max-w-xl">
          <Story />
        </div>
      </QueryStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByPlaceholderText("Search bookmarks or paste a URL..."),
    ).toBeInTheDocument();
  },
};

export const WithBookmarks: Story = {
  args: {
    value: [
      {
        bookmarkId: "b1",
        title: "The Rust Book",
        url: "https://doc.rust-lang.org/book/",
      },
      {
        bookmarkId: "b2",
        title: "A note with no URL",
        url: null,
      },
    ],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("The Rust Book")).toBeInTheDocument();
    await expect(canvas.getByText("A note with no URL")).toBeInTheDocument();
  },
};
