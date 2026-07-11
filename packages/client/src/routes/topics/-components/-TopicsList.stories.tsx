import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TopicsList } from "./-TopicsList";

import { makeTopics } from "@/test-utils/radarFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText, playTableViewToggle } from "@/test-utils/storyPlay";

const topics = makeTopics(4);

const meta: Meta<typeof TopicsList> = {
  component: TopicsList,
  args: {
    topics,
    onBulkDelete: fn(() => Promise.resolve()),
  },
  decorators: [cardStoryDecorator()],
  // Reset persisted view-mode so each story starts in card view.
  beforeEach: () => {
    window.localStorage.clear();
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Kubernetes"),
};

export const Empty: Story = {
  args: {
    topics: [],
  },
  play: smokeText("No courses yet!"),
};

export const TableView: Story = {
  play: playTableViewToggle,
};
