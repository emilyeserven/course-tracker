import type { Meta, StoryObj } from "@storybook/react-vite";

import { GoogleCalendarSection } from "./-GoogleCalendarSection";

import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeCalendarFeed } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";
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
  play: smokePlay([
    {
      role: "heading",
      name: "Calendar",
    },
    {
      text: "Personal",
    },
    {
      role: "button",
      name: /add calendar/i,
    },
  ]),
};

// No feeds subscribed yet — just the add-feed form.
export const Empty: Story = {
  decorators: [queryStubDecorator(() => clientWith([]))],
  play: smokePlay([{
    placeholder: /calendar name/i,
  }]),
};
