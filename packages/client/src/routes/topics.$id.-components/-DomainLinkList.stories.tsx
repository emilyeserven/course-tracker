import type { TopicDomain } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DomainLinkList } from "./-DomainLinkList";

import { routerDecorator } from "@/test-utils/storyDecorators";
import { smokeLink } from "@/test-utils/storyPlay";

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
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeLink("Frontend Engineering"),
};

export const Empty: Story = {
  args: {
    domains: [],
  },
};
