import type { Meta, StoryObj } from "@storybook/react-vite";

import { TaskBookmarksList } from "./-TaskBookmarksList";

import { QueryStub } from "@/test-utils/QueryStub";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof TaskBookmarksList> = {
  component: TaskBookmarksList,
  args: {
    bookmarks: [
      {
        id: "tb-1",
        bookmarkId: "bm-1",
        title: "Pimsleur Spanish",
        url: "https://example.com/pimsleur",
        position: 0,
      },
    ],
  },
  decorators: [
    Story => (
      <QueryStub>
        <Story />
      </QueryStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Linked: Story = {
  play: smokeText("Pimsleur Spanish"),
};

export const WithSectionAndNoUrl: Story = {
  args: {
    bookmarks: [
      {
        id: "tb-2",
        bookmarkId: "bm-2",
        title: "Grammar notes",
        url: null,
        sectionLabel: "Chapter 4",
        position: 0,
      },
    ],
  },
  play: smokeText("Grammar notes", /Chapter 4/),
};
