import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

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

export const Default: Story = {};

/** Clicking Create with the required field filled fires `onSubmit`. */
export const Submitting: Story = {};

/** An empty required field disables Create. */
export const RequiredEmpty: Story = {
  args: {
    initialPrimaryValue: "",
  },
};

export const InFlight: Story = {
  args: {
    submitting: true,
  },
};
