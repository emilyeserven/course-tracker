import type { Meta, StoryObj } from "@storybook/react-vite";

import { InputField } from "./InputField";

import { FormFieldHarness } from "@/test-utils/FormFieldHarness";

const meta = {
  component: InputField,
  args: {
    label: "Resource name",
    placeholder: "React 19 essentials",
  },
  decorators: [
    (Story, {
      parameters,
    }) => (
      <FormFieldHarness defaultValue={(parameters.fieldValue as string) ?? ""}>
        {() => (
          <div className="max-w-sm">
            <Story />
          </div>
        )}
      </FormFieldHarness>
    ),
  ],
} satisfies Meta<typeof InputField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  parameters: {
    fieldValue: "React 19 essentials",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/** Typing updates the field value through the form's `handleChange`. */
export const Typing: Story = {};
