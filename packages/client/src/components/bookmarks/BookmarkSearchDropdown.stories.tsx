import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BookmarkSearchDropdown } from "./BookmarkSearchDropdown";

import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof BookmarkSearchDropdown> = {
  component: BookmarkSearchDropdown,
  args: {
    trimmed: "spanish",
    looksLikeUrl: false,
    isAdding: false,
    isFetching: false,
    isError: false,
    results: [],
    onAddByUrl: fn(),
    onSelect: fn(),
  },
  decorators: [
    Story => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WithResults: Story = {
  args: {
    results: [
      {
        id: "bm-1",
        title: "Pimsleur Spanish",
        url: "https://example.com/pimsleur",
      },
    ],
  },
  play: smokeText("Pimsleur Spanish"),
};

export const Empty: Story = {
  play: smokeText("No bookmarks found. Paste a URL to add one."),
};

export const Searching: Story = {
  args: {
    isFetching: true,
  },
  play: smokeText(/Searching/),
};

export const Unreachable: Story = {
  args: {
    isError: true,
  },
  play: smokeText("Simple Bookmarks is unreachable."),
};

export const AddByUrl: Story = {
  args: {
    trimmed: "https://example.com/new-page",
    looksLikeUrl: true,
  },
  play: smokeText(/Add bookmark for/),
};
