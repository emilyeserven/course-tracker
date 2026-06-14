import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DetailsTab } from "./-DetailsTab";

import { makeDomain, makeTopicRows } from "@/test-utils/boxFixtures";

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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByDisplayValue("Frontend Engineering"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Topics in domain")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save details/i,
      }),
    ).toBeInTheDocument();
  },
};

// A brand-new-ish domain with no description still renders the editable form.
export const EmptyDescription: Story = {
  args: {
    domain: makeDomain({
      title: "Backend Engineering",
      description: null,
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByDisplayValue("Backend Engineering"),
    ).toBeInTheDocument();
  },
};
