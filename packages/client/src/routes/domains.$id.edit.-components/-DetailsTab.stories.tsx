import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DetailsTab } from "./-DetailsTab";

import { makeDomain, makeTopicRows } from "@/test-utils/boxFixtures";
import { smokePlay } from "@/test-utils/storyPlay";

const meta: Meta<typeof DetailsTab> = {
  component: DetailsTab,
  args: {
    domain: makeDomain(),
    topics: makeTopicRows(),
    onSaved: fn(() => Promise.resolve()),
    onChangeStateChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Hydrates the form from the domain's persisted title/description/topics.
export const Default: Story = {
  play: smokePlay([
    {
      displayValue: "Frontend Engineering",
    },
    {
      text: "Topics in domain",
    },
    {
      role: "button",
      name: /save details/i,
    },
  ]),
};

// A brand-new-ish domain with no description still renders the editable form.
export const EmptyDescription: Story = {
  args: {
    domain: makeDomain({
      title: "Backend Engineering",
      description: null,
    }),
  },
  play: smokePlay([{
    displayValue: "Backend Engineering",
  }]),
};
