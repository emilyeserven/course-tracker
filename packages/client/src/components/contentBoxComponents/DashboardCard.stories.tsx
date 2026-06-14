import type { Meta, StoryObj } from "@storybook/react-vite";

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

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: <Button size="sm">Add</Button>,
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
};
