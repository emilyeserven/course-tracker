import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DashboardCard, DashboardSectionStatus } from "./DashboardCard";

import { Button } from "@/components/ui/button";

const meta: Meta<typeof DashboardCard> = {
  component: DashboardCard,
  args: {
    title: "Recent courses",
    children: <p className="text-sm">Card body content.</p>,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Recent courses")).toBeInTheDocument();
    await expect(canvas.getByText("Card body content.")).toBeInTheDocument();
  },
};

export const WithAction: Story = {
  args: {
    action: <Button size="sm">Add</Button>,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Add",
      }),
    ).toBeInTheDocument();
  },
};

export const SectionPending: Story = {
  render: () => (
    <DashboardCard title="Courses">
      <DashboardSectionStatus
        isPending
        entity="courses"
        emptyMessage="No courses yet."
      />
    </DashboardCard>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Loading/)).toBeInTheDocument();
  },
};

export const SectionEmpty: Story = {
  render: () => (
    <DashboardCard title="Courses">
      <DashboardSectionStatus
        isEmpty
        entity="courses"
        emptyMessage="No courses yet."
      />
    </DashboardCard>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No courses yet.")).toBeInTheDocument();
  },
};
