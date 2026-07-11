import type { Meta, StoryObj } from "@storybook/react-vite";

import { EntityLink } from "./EntityLink";

import { routerDecorator } from "@/test-utils/storyDecorators";
import { smokeLink } from "@/test-utils/storyPlay";

const meta: Meta<typeof EntityLink> = {
  component: EntityLink,
  args: {
    entity: "resources",
    id: 1,
    children: "React",
  },
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeLink("React"),
};
