import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DomainTagList } from "./DomainTagList";

const meta: Meta<typeof DomainTagList> = {
  component: DomainTagList,
  args: {
    domains: [
      {
        id: "1",
        title: "Frontend",
      },
      {
        id: "2",
        title: "Design",
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Frontend")).toBeInTheDocument();
    await expect(canvas.getByText("Design")).toBeInTheDocument();
  },
};

export const EmptyWithFallback: Story = {
  args: {
    domains: [],
    fallback: <span>No domains</span>,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No domains")).toBeInTheDocument();
  },
};
