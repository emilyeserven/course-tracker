import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { MultiComboboxField } from "./MultiComboboxField";

import {
  makeGroupedSelectOptions,
  makeSelectOptions,
} from "@/test-utils/formFieldFixtures";
import { FormFieldHarness } from "@/test-utils/FormFieldHarness";

const meta = {
  component: MultiComboboxField,
  args: {
    label: "Tags",
    options: makeSelectOptions(),
    placeholder: "Pick tags...",
  },
  decorators: [
    (Story, {
      parameters,
    }) => (
      <FormFieldHarness
        defaultValue={(parameters.fieldValue as string[]) ?? []}
      >
        {() => (
          <div className="max-w-sm">
            <Story />
          </div>
        )}
      </FormFieldHarness>
    ),
  ],
} satisfies Meta<typeof MultiComboboxField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Tags")).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText("Pick tags...")).toBeInTheDocument();
  },
};

/** Seeded values render as chips. */
export const WithSelection: Story = {
  parameters: {
    fieldValue: ["book", "course"],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Book")).toBeInTheDocument();
    await expect(canvas.getByText("Course")).toBeInTheDocument();
  },
};

/** `groupByPrefix` buckets options under headers derived from their value prefix. */
export const Grouped: Story = {
  args: {
    options: makeGroupedSelectOptions(),
    groupByPrefix: true,
  },
};
