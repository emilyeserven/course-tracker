import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { InputField } from "./InputField";

import { FormFieldHarness } from "@/test-utils/FormFieldHarness";
import {
  playExpectDisabled,
  playTypeIntoTextbox,
} from "@/test-utils/storyPlays";

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

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Resource name")).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText("React 19 essentials"),
    ).toBeInTheDocument();
  },
};

export const Filled: Story = {
  parameters: {
    fieldValue: "React 19 essentials",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveValue("React 19 essentials");
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: playExpectDisabled("textbox"),
};

/** Typing updates the field value through the form's `handleChange`. */
export const Typing: Story = {
  play: playTypeIntoTextbox("Clean Architecture"),
};
