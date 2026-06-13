import type { Meta, StoryObj } from "@storybook/react-vite";

import { EyeIcon } from "lucide-react";
import { expect, within } from "storybook/test";

import { EntityHeaderButton } from "./EntityHeaderButton";

import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof EntityHeaderButton> = {
  component: EntityHeaderButton,
  args: {
    to: "/providers/$id",
    params: {
      id: "p1",
    },
    label: "View Provider",
    icon: <EyeIcon className="size-4" />,
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
      await canvas.findByRole("link", {
        name: /View Provider/,
      }),
    ).toBeInTheDocument();
  },
};
