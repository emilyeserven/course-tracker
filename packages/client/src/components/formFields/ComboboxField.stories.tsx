import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ComboboxField } from "./ComboboxField";

import {
  makeCreateConfig,
  makeSelectOptions,
} from "@/test-utils/formFieldFixtures";
import { FormFieldHarness } from "@/test-utils/FormFieldHarness";

const meta = {
  component: ComboboxField,
  args: {
    label: "Topic",
    options: makeSelectOptions(),
    placeholder: "Search topics...",
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
} satisfies Meta<typeof ComboboxField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Topic")).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText("Search topics..."),
    ).toBeInTheDocument();
  },
};

export const Selected: Story = {
  parameters: {
    fieldValue: "course",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByDisplayValue("Course")).toBeInTheDocument();
  },
};

/** With a `create` config the field offers an inline "add new option" flow. */
export const WithCreate: Story = {
  args: {
    create: makeCreateConfig(),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByPlaceholderText("Search topics..."),
    ).toBeInTheDocument();
  },
};
