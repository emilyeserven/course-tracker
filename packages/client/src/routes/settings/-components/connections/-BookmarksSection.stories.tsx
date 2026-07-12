import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { BookmarksSection } from "./-BookmarksSection";

import { QueryStub } from "@/test-utils/QueryStub";
import { seededSettingsClient } from "@/test-utils/settingsFixtures";

const meta = {
  component: BookmarksSection,
  decorators: [
    Story => (
      <QueryStub
        client={seededSettingsClient({
          bookmarkApiUrl: null,
          bookmarkApiUrlResolved: "http://eserve-raspi:3000",
          bookmarkClickTarget: "page",
        })}
      >
        <div className="max-w-xl">
          <Story />
        </div>
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof BookmarksSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // The resolved default endpoint seeds the input placeholder.
    await expect(
      canvas.getByPlaceholderText("http://eserve-raspi:3000"),
    ).toBeInTheDocument();
    // Both click-behavior choices render.
    await expect(
      canvas.getByText(/open the page itself/i),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/open the bookmark's page/i),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /clear & refresh/i,
      }),
    ).toBeInTheDocument();
  },
};

// A configured override pre-fills the endpoint input and shows the reset action.
export const WithOverride: Story = {
  decorators: [
    Story => (
      <QueryStub
        client={seededSettingsClient({
          bookmarkApiUrl: "http://my-bookmarks:8080",
          bookmarkApiUrlResolved: "http://my-bookmarks:8080",
          bookmarkClickTarget: "bookmark",
        })}
      >
        <div className="max-w-xl">
          <Story />
        </div>
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByDisplayValue("http://my-bookmarks:8080"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /reset to default/i,
      }),
    ).toBeInTheDocument();
  },
};
