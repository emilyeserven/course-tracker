import type { Meta, StoryObj } from "@storybook/react-vite";

import { PageHeader } from "./PageHeader";

import { routerStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta: Meta<typeof PageHeader> = {
  component: PageHeader,
  args: {
    pageTitle: "Your Resources",
    description: "Everything you're learning from, in one place.",
  },
  decorators: [routerStoryDecorator()],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokePlay([{
    role: "heading",
    name: "Your Resources",
  }]),
};

// With a `pageSection` set, a breadcrumb-style section <Link> renders.
export const WithSectionLink: Story = {
  args: {
    pageSection: "resources",
    pageTitle: "React Fundamentals",
  },
  play: smokePlay([{
    role: "link",
    name: "Resources",
  }]),
};
