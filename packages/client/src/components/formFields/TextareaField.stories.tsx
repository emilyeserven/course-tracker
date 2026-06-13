import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileTextIcon } from "lucide-react";
import { expect, within } from "storybook/test";

import { TextareaField } from "./TextareaField";

import { FormFieldHarness } from "@/test-utils/FormFieldHarness";

const meta = {
  component: TextareaField,
  args: {
    label: "Description",
    placeholder: "What is this resource about?",
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
} satisfies Meta<typeof TextareaField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Description")).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText("What is this resource about?"),
    ).toBeInTheDocument();
  },
};

export const Filled: Story = {
  parameters: {
    fieldValue: "A deep dive into the React 19 compiler and Actions API.",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveValue(
      "A deep dive into the React 19 compiler and Actions API.",
    );
  },
};

export const WithLabelIcon: Story = {
  args: {
    labelIcon: <FileTextIcon className="size-4" />,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Description")).toBeInTheDocument();
  },
};
