import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { NumberField } from "./NumberField";

import { FormFieldHarness } from "@/test-utils/FormFieldHarness";

const meta = {
  component: NumberField,
  args: {
    label: "Progress (%)",
  },
  decorators: [
    (Story, {
      parameters,
    }) => (
      <FormFieldHarness
        defaultValue={(parameters.fieldValue as number | null) ?? null}
      >
        {() => (
          <div className="max-w-sm">
            <Story />
          </div>
        )}
      </FormFieldHarness>
    ),
  ],
} satisfies Meta<typeof NumberField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Progress (%)")).toBeInTheDocument();
    await expect(canvas.getByRole("spinbutton")).toHaveValue(null);
  },
};

export const WithValue: Story = {
  parameters: {
    fieldValue: 42,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("spinbutton")).toHaveValue(42);
  },
};

export const Constrained: Story = {
  args: {
    min: 0,
    step: "5",
  },
};
