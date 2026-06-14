import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { ReadwiseSection } from "./-ReadwiseSection";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeAppSettings } from "@/test-utils/settingsFixtures";
import { queryKeys } from "@/utils/queryKeys";

function seededClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(queryKeys.settings.detail(), makeAppSettings());
  return client;
}

const meta = {
  component: ReadwiseSection,
  decorators: [
    Story => (
      <QueryStub client={seededClient()}>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof ReadwiseSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The Readwise integration wraps IntegrationKeySection with its preset copy.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: "Readwise",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", {
        name: /readwise\.io\/access_token/i,
      }),
    ).toBeInTheDocument();
  },
};
