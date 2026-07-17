import type { Meta, StoryObj } from "@storybook/react-vite";

import { PageContainer } from "./PageContainer";

import { smokeText } from "@/test-utils/storyPlay";

const meta = {
  component: PageContainer,
  args: {
    children: "Page content",
  },
} satisfies Meta<typeof PageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Page content"),
};
