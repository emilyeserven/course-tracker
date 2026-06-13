import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { RadioGroupField } from "./RadioGroupField";

import { makeSelectOptions } from "@/test-utils/formFieldFixtures";
import { FormFieldHarness } from "@/test-utils/FormFieldHarness";

const meta = {
  component: RadioGroupField,
  args: {
    label: "Resource type",
    options: makeSelectOptions(),
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
} satisfies Meta<typeof RadioGroupField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Resource type")).toBeInTheDocument();
    await expect(canvas.getAllByRole("radio")).toHaveLength(3);
  },
};

export const Preselected: Story = {
  parameters: {
    fieldValue: "course",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", {
      name: "Course",
    })).toBeChecked();
  },
};

/** Selecting an option updates the field value. */
export const Selecting: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const book = canvas.getByRole("radio", {
      name: "Book",
    });
    await userEvent.click(book);
    await expect(book).toBeChecked();
  },
};
