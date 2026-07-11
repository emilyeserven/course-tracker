import type { CourseProvider, ResourceInResources } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ResourcesList } from "./-ResourcesList";

import { cardStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText, playTableViewToggle } from "@/test-utils/storyPlay";

const cost = {
  cost: "100",
  isCostFromPlatform: false,
  splitBy: 1,
};

const resources: ResourceInResources[] = [
  {
    id: "r1",
    name: "React Fundamentals",
    url: "https://example.com/react",
    dateExpires: "",
    cost,
    progressCurrent: 3,
    progressTotal: 10,
    status: "active",
    provider: {
      id: "p1",
      name: "Frontend Masters",
    },
  },
  {
    id: "r2",
    name: "Advanced TypeScript",
    url: "",
    dateExpires: "",
    cost,
    progressCurrent: 10,
    progressTotal: 10,
    status: "complete",
  },
];

const providers: CourseProvider[] = [
  {
    id: "p1",
    name: "Frontend Masters",
    url: "https://frontendmasters.com",
    resourceCount: 1,
  },
];

const meta: Meta<typeof ResourcesList> = {
  component: ResourcesList,
  args: {
    resources,
    providers,
  },
  decorators: [cardStoryDecorator()],
  // Reset persisted view-mode so each story starts in grid view.
  beforeEach: () => {
    window.localStorage.clear();
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("React Fundamentals", "Advanced TypeScript"),
};

export const Empty: Story = {
  args: {
    resources: [],
    providers: [],
  },
  play: smokeText("No resources yet!"),
};

export const TableView: Story = {
  play: playTableViewToggle,
};
