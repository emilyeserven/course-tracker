import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";

import {
  asChildArgs,
  buttonMetaArgs,
  buttonVariantArgs,
} from "@/test-utils/buttonStoryFixtures";

const meta: Meta<typeof Button> = {
  component: Button,
  args: buttonMetaArgs(),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: buttonVariantArgs.secondary,
};

export const Destructive: Story = {
  args: buttonVariantArgs.destructive,
};

export const Outline: Story = {
  args: buttonVariantArgs.outline,
};

export const Ghost: Story = {
  args: buttonVariantArgs.ghost,
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
};

export const AsChild: Story = {
  args: asChildArgs,
};
