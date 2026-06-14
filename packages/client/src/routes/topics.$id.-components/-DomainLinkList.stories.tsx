import type { TopicDomain } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DomainLinkList } from "./-DomainLinkList";

import { RouterStub } from "@/test-utils/RouterStub";

const domains: TopicDomain[] = [
  {
    id: "domain-1",
    title: "Frontend Engineering",
  },
  {
    id: "domain-2",
    title: "Developer Tooling",
  },
];

const meta: Meta<typeof DomainLinkList> = {
  component: DomainLinkList,
  args: {
    domains,
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: "Frontend Engineering",
      }),
    ).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    domains: [],
  },
};
