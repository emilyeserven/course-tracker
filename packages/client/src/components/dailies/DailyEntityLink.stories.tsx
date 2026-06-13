import type { Meta, StoryObj } from "@storybook/react-vite";

import { CheckSquareIcon, GraduationCapIcon } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

import { DailyEntityLink } from "./DailyEntityLink";

import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof DailyEntityLink> = {
  component: DailyEntityLink,
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

export const TaskLink: Story = {
  args: {
    entity: "tasks",
    id: "t1",
    icon: <CheckSquareIcon className="size-4" />,
    tooltip: "Go to Task",
    ariaLabel: "Go to task Read SICP",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const link = await canvas.findByRole("link", {
      name: "Go to task Read SICP",
    });
    await userEvent.hover(link);
    // Radix portals the tooltip outside canvasElement, so query the document.
    await expect(
      await within(document.body).findByRole("tooltip"),
    ).toHaveTextContent("Go to Task");
  },
};

export const ResourceLink: Story = {
  args: {
    entity: "resources",
    id: "c1",
    icon: <GraduationCapIcon className="size-4" />,
    tooltip: "Structure and Interpretation of Computer Programs",
    ariaLabel: "Go to course SICP",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: "Go to course SICP",
      }),
    ).toBeInTheDocument();
  },
};
