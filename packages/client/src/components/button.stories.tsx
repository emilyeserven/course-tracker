import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  args: {
    children: "Button",
    onClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Button",
    }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

// `asChild` renders the child element with the button styling, so the rendered
// node here is a link rather than a <button>.
export const AsChild: Story = {
  args: {
    asChild: true,
    children: <a href="/somewhere">Link button</a>,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", {
        name: "Link button",
      }),
    ).toBeInTheDocument();
  },
};
