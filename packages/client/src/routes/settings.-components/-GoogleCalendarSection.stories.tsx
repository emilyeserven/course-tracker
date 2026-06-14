import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { GoogleCalendarSection } from "./-GoogleCalendarSection";

import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeCalendarFeed } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";
import { queryKeys } from "@/utils/queryKeys";

function clientWith(feeds = [makeCalendarFeed()]) {
  return seededQueryClient([[queryKeys.googleCalendar.feeds(), feeds]]);
}

const meta = {
  component: GoogleCalendarSection,
  decorators: [queryStubDecorator(clientWith)],
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
  decorators: [queryStubDecorator(() => clientWith([]))],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByPlaceholderText(/calendar name/i),
    ).toBeInTheDocument();
  },
};
