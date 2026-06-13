import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlusIcon } from "lucide-react";
import { expect, within } from "storybook/test";

import { PageHeader } from "./PageHeader";

import { Button } from "@/components/ui/button";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof PageHeader> = {
  component: PageHeader,
  args: {
    pageTitle: "Your Resources",
    description: "Everything you're learning from, in one place.",
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
      await canvas.findByRole("heading", {
        name: "Your Resources",
      }),
    ).toBeInTheDocument();
  },
};

// With a `pageSection` set, a breadcrumb-style section <Link> renders.
export const WithSectionLink: Story = {
  args: {
    pageSection: "resources",
    pageTitle: "React Fundamentals",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: "Resources",
      }),
    ).toBeInTheDocument();
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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("button", {
        name: /New Course/,
      }),
    ).toBeInTheDocument();
  },
};

// A non-zero progress value renders the ProgressBar beneath the header.
export const WithProgress: Story = {
  args: {
    progressCurrent: 3,
    progressTotal: 10,
    status: "active",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", {
        name: "Your Resources",
      }),
    ).toBeInTheDocument();
  },
};
