import type { AppSettingsSummary } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { BookmarkLinkingProvider } from "./BookmarkLinkingProvider";
import { OpenBookmarkPageButton } from "./OpenBookmarkPageButton";

import { QueryStub } from "@/test-utils/QueryStub";
import { seededSettingsClient } from "@/test-utils/settingsFixtures";

// The button reads the app-wide bookmark preference from settings via context,
// so each story seeds the settings query and wraps in the provider.
function withSettings(overrides: Partial<AppSettingsSummary>) {
  const client = seededSettingsClient(overrides);
  return function Decorator(Story: () => React.ReactElement) {
    return (
      <QueryStub client={client}>
        <BookmarkLinkingProvider>
          <Story />
        </BookmarkLinkingProvider>
      </QueryStub>
    );
  };
}

const meta = {
  component: OpenBookmarkPageButton,
  args: {
    linkable: {
      externalId: "abc123",
      url: "https://example.com/article",
    },
  },
} satisfies Meta<typeof OpenBookmarkPageButton>;

export default meta;

type Story = StoryObj<typeof meta>;

// With the "page" preference and an endpoint configured, the shortcut to the
// Simple Bookmarks page is shown.
export const Visible: Story = {
  decorators: [
    withSettings({
      bookmarkApiUrlResolved: "http://eserve-raspi:3000",
      bookmarkClickTarget: "page",
    }),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const link = await canvas.findByRole("link", {
      name: /open bookmark page/i,
    });
    await expect(link).toHaveAttribute(
      "href",
      "http://eserve-raspi:3000/bookmarks/abc123",
    );
  },
};

// When the primary click already opens the bookmark page, the shortcut is
// redundant and hidden.
export const HiddenForBookmarkTarget: Story = {
  decorators: [
    withSettings({
      bookmarkApiUrlResolved: "http://eserve-raspi:3000",
      bookmarkClickTarget: "bookmark",
    }),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole("link", {
        name: /open bookmark page/i,
      }),
    ).toBeNull();
  },
};
