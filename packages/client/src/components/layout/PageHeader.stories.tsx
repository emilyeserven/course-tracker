import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlusIcon } from "lucide-react";

import { PageHeader } from "./PageHeader";

import { Button } from "@/components/ui/button";
import { routerStoryDecorator } from "@/test-utils/storyDecorators";

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

export const Default: Story = {};

// With a `pageSection` set, a breadcrumb-style section <Link> renders.
export const WithSectionLink: Story = {
  args: {
    pageSection: "resources",
    pageTitle: "React Fundamentals",
  },
};

// Header actions render in the children slot.
export const WithAction: Story = {
  args: {
    children: (
      <Button>
        <PlusIcon className="size-4" />
        New Course
      </Button>
    ),
  },
};

// A non-zero progress value renders the ProgressBar beneath the header.
export const WithProgress: Story = {
  args: {
    progressCurrent: 3,
    progressTotal: 10,
    status: "active",
  },
};
