import type { Meta, StoryObj } from "@storybook/react-vite";

import { EyeIcon } from "lucide-react";

import { EntityHeaderButton } from "./EntityHeaderButton";

import { routerDecorator } from "@/test-utils/storyDecorators";
import { smokeLink } from "@/test-utils/storyPlay";

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
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeLink(/View Provider/),
};
