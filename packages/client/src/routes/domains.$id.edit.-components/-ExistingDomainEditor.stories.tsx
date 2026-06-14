import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { ExistingDomainEditor } from "./-ExistingDomainEditor";

import { makeDomain, makeTopicRows } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { makeRadar } from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const DOMAIN_ID = "domain-1";

// Seeds the three reads the editor makes (domain / radar / topics) so it renders
// the loaded tab UI without hitting the network. staleTime keeps the seeded data
// from triggering a background refetch.
function seededClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(["domain", DOMAIN_ID], makeDomain());
  client.setQueryData(["radar", DOMAIN_ID], makeRadar());
  client.setQueryData(["topics"], makeTopicRows());
  return client;
}

const meta = {
  component: ExistingDomainEditor,
  args: {
    id: DOMAIN_ID,
    tab: "details",
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof ExistingDomainEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

// With the queries seeded the editor shows its header, tab strip, and the
// (default) Details tab body.
export const Loaded: Story = {
  decorators: [
    Story => (
      <QueryStub client={seededClient()}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", {
        name: /edit domain/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("tab", {
      name: /details/i,
    })).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save details/i,
      }),
    ).toBeInTheDocument();
  },
};

// Before the domain query resolves the editor renders its loading placeholder.
export const Loading: Story = {
  decorators: [
    Story => (
      <QueryStub>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/loading domain/i),
    ).toBeInTheDocument();
  },
};
