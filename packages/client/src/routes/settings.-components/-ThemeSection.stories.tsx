import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeSection } from "./-ThemeSection";

import { ThemeProvider } from "@/context/ThemeProvider";
import { providerStoryDecorator } from "@/test-utils/storyDecorators";

const meta = {
  component: ThemeSection,
  decorators: [providerStoryDecorator(ThemeProvider)],
} satisfies Meta<typeof ThemeSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The single light/dark toggle button (label depends on the active theme).
export const Default: Story = {};
