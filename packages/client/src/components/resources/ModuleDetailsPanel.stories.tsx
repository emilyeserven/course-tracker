import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { ModuleDetailsPanel } from "./ModuleDetailsPanel";

import { makeModule } from "@/test-utils/resourceModulesFixtures";
import { smokePlay } from "@/test-utils/storyPlay";

const meta: Meta<typeof ModuleDetailsPanel> = {
  component: ModuleDetailsPanel,
  args: {
    module: makeModule(),
    onEdit: fn(),
  },
  // The component renders an <li>, so host it in a <ul>.
  decorators: [
    Story => (
      <ul className="max-w-md rounded-md border">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokePlay([
    {
      text: "An overview of the basics.",
    },
    {
      role: "button",
      name: /Edit/i,
    },
  ]),
};

export const NoDescription: Story = {
  args: {
    module: makeModule({
      description: null,
    }),
  },
  play: smokePlay([{
    text: "No description.",
  }]),
};
