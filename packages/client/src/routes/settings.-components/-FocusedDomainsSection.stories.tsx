import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { FocusedDomainsSection } from "./-FocusedDomainsSection";

import { makeDomain } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { makeAppSettings } from "@/test-utils/settingsFixtures";
import { queryKeys } from "@/utils/queryKeys";

// Seeds settings + domains so the form (rather than the loading placeholder)
// renders.
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
  client.setQueryData(queryKeys.domains.list(), [
    makeDomain(),
    makeDomain({
      id: "domain-2",
      title: "Backend Engineering",
    }),
  ]);
  return client;
}

const meta = {
  component: FocusedDomainsSection,
} satisfies Meta<typeof FocusedDomainsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The focused-domains picker + save action once the queries resolve.
export const Default: Story = {
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
    await expect(canvas.getByText("Focused domains")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save focused domains/i,
      }),
    ).toBeInTheDocument();
  },
};

// Before the queries resolve the section shows its loading placeholder.
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
      canvas.getByText(/loading domains/i),
    ).toBeInTheDocument();
  },
};
