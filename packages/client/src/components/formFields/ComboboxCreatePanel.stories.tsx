import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { ComboboxCreatePanel } from "./ComboboxCreatePanel";

import { makeCreateConfig } from "@/test-utils/formFieldFixtures";
import { constrainedDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof ComboboxCreatePanel> = {
  component: ComboboxCreatePanel,
  args: {
    config: makeCreateConfig(),
    initialPrimaryValue: "Udemy",
    onCancel: fn(),
    onSubmit: fn(),
  },
  decorators: [constrainedDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/New/)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/Name/)).toHaveValue("Udemy");
    await expect(
      canvas.getByRole("button", {
        name: "Create",
      }),
    ).toBeEnabled();
  },
};

/** Clicking Create with the required field filled fires `onSubmit`. */
export const Submitting: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Create",
    }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
