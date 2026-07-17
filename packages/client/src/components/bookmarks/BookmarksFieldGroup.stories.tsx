import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BookmarksFieldGroup } from "./BookmarksFieldGroup";

import { QueryStub } from "@/test-utils/QueryStub";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof BookmarksFieldGroup> = {
  component: BookmarksFieldGroup,
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
  play: smokeText("Bookmarks"),
};

export const WithSelection: Story = {
  args: {
    value: [
      {
        id: "tb-1",
        bookmarkId: "bm-1",
        title: "Pimsleur Spanish",
        url: "https://example.com/pimsleur",
        position: 0,
      },
    ],
  },
  play: smokeText("Bookmarks", "Pimsleur Spanish"),
};
