import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DatePickerField } from "./DatePickerField";

import { FormFieldHarness } from "@/test-utils/FormFieldHarness";

const meta = {
  component: DatePickerField,
  args: {
    label: "Expiry date",
  },
  decorators: [
    (Story, {
      parameters,
    }) => (
      <FormFieldHarness
        defaultValue={(parameters.fieldValue as Date | null) ?? null}
      >
        {() => (
          <div className="max-w-sm">
            <Story />
          </div>
        )}
      </FormFieldHarness>
    ),
  ],
} satisfies Meta<typeof DatePickerField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** No value → the trigger shows the placeholder and there's no clear button. */
export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Expiry date")).toBeInTheDocument();
    await expect(canvas.getByText("No expiry date")).toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", {
        name: "Clear date",
      }),
    ).not.toBeInTheDocument();
  },
};

export const WithDate: Story = {
  parameters: {
    fieldValue: new Date(2026, 11, 25),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(new Date(2026, 11, 25).toLocaleDateString()),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: "Clear date",
      }),
    ).toBeInTheDocument();
  },
};
