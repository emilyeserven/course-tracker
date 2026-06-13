import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { DailyDetailsPanel } from "./DailyDetailsPanel";

import { makeDaily, makeRecentCompletions } from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

const daily = makeDaily({
  id: "daily-1",
  name: "Spanish practice",
  description: "Build conversational fluency.",
  location: "Library, desk 4",
  provider: {
    id: "prov-1",
    name: "Duolingo",
  },
  completions: makeRecentCompletions([
    "goal",
    "touched",
    "goal",
    "goal",
    "exceeded",
  ]),
  criteria: {
    touched: "Opened the app and did at least one lesson.",
    goal: "30 minutes of focused practice.",
    exceeded: "60+ minutes or a conversation.",
  },
});

// Seed the cache the panel reads via useQuery(["daily", id]) so it renders the
// loaded state without a real API.
// staleTime Infinity so the seeded entry is never refetched — a background
// refetch would hit no API, flip the query to `error`, and render EntityError.
const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});
client.setQueryData(["daily", "daily-1"], daily);

const meta: Meta<typeof DailyDetailsPanel> = {
  component: DailyDetailsPanel,
  args: {
    dailyId: "daily-1",
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={client}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DetailsTab: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Build conversational fluency."),
    ).toBeInTheDocument();
  },
};

export const CriteriaTab: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("tab", {
        name: "Status Criteria",
      }),
    );
    await expect(
      await canvas.findByText("30 minutes of focused practice."),
    ).toBeInTheDocument();
  },
};
