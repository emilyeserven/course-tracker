import type { Domain } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { TopicsList } from "./-TopicsList";

import { makeTopics } from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const topics = makeTopics(4);

const domains: Domain[] = [
  {
    id: "d1",
    title: "Frontend",
    topicCount: 2,
  },
  {
    id: "d2",
    title: "Infrastructure",
    topicCount: 1,
  },
];

const meta: Meta<typeof TopicsList> = {
  component: TopicsList,
  args: {
    topics,
    domains,
    onBulkDelete: fn(() => Promise.resolve()),
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
  // Reset persisted view-mode so each story starts in card view.
  beforeEach: () => {
    window.localStorage.clear();
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Kubernetes")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    topics: [],
    domains: [],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No courses yet!")).toBeInTheDocument();
  },
};

export const TableView: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Table view",
      }),
    );
    await expect(canvas.getByRole("table")).toBeInTheDocument();
  },
};
