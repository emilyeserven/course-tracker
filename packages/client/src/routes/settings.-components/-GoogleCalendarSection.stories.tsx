import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { GoogleCalendarSection } from "./-GoogleCalendarSection";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeCalendarFeed } from "@/test-utils/settingsFixtures";
import { queryKeys } from "@/utils/queryKeys";

function clientWith(feeds = [makeCalendarFeed()]) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(queryKeys.googleCalendar.feeds(), feeds);
  return client;
}

const meta = {
  component: GoogleCalendarSection,
  decorators: [
    Story => (
      <QueryStub client={clientWith()}>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof GoogleCalendarSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// A subscribed feed plus the add-feed form.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: "Calendar",
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Personal")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /add calendar/i,
      }),
    ).toBeInTheDocument();
  },
};

// No feeds subscribed yet — just the add-feed form.
export const Empty: Story = {
  decorators: [
    Story => (
      <QueryStub client={clientWith([])}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByPlaceholderText(/calendar name/i),
    ).toBeInTheDocument();
  },
};
