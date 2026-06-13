import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { useState } from "react";

import { expect, userEvent, within } from "storybook/test";

import { PageTabs } from "./PageTabs";

const tabs = [
  {
    value: "overview",
    label: "Overview",
    content: <p>Overview panel</p>,
  },
  {
    value: "details",
    label: "Details",
    content: <p>Details panel</p>,
  },
];

// PageTabs is controlled; drive `value` from local state so clicks switch tabs.
function ControlledPageTabs(args: ComponentProps<typeof PageTabs>) {
  const [value, setValue] = useState(args.value);
  return (
    <PageTabs
      {...args}
      value={value}
      onValueChange={setValue}
    />
  );
}

const meta: Meta<typeof PageTabs> = {
  component: PageTabs,
  args: {
    tabs,
    value: "overview",
  },
  render: args => <ControlledPageTabs {...args} />,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("tab", {
        name: "Overview",
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Overview panel")).toBeInTheDocument();
  },
};

export const SwitchTab: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", {
      name: "Details",
    }));
    await expect(canvas.getByText("Details panel")).toBeInTheDocument();
  },
};
