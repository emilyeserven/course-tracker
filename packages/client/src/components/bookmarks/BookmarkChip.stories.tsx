import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { BookmarkChip } from "./BookmarkChip";

import { QueryStub } from "@/test-utils/QueryStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";
import { queryKeys } from "@/utils/queryKeys";

const association = {
  id: "tb-1",
  bookmarkId: "bm-1",
  title: "Pimsleur Spanish",
  url: "https://example.com/pimsleur",
};

const meta: Meta<typeof BookmarkChip> = {
  component: BookmarkChip,
  args: {
    association,
    onRemove: fn(),
    onChangeSection: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// No sections cached: just the title link, open-page and remove buttons.
export const NoSections: Story = {
  decorators: [
    Story => (
      <QueryStub>
        <ul className="flex flex-wrap gap-2">
          <Story />
        </ul>
      </QueryStub>
    ),
  ],
  play: smokeText("Pimsleur Spanish"),
};

// Seeded sections: the section-narrowing select appears.
export const WithSections: Story = {
  decorators: [
    queryStoryDecorator(
      seededQueryClient([
        [
          queryKeys.bookmarks.sections("bm-1"),
          [
            {
              id: "sec-1",
              label: "Unit 3",
            },
          ],
        ],
      ]),
    ),
    Story => (
      <ul className="flex flex-wrap gap-2">
        <Story />
      </ul>
    ),
  ],
  play: smokeText("Pimsleur Spanish", "Whole bookmark", "Unit 3"),
};
