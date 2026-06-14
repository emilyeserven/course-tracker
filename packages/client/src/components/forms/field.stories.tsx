import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./field";

import { Input } from "@/components/ui/input";

const meta = {
  component: Field,
  decorators: [
    Story => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A labelled field with a description — the building block every form field wraps. */
export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="resource-name">Resource name</FieldLabel>
      <Input
        id="resource-name"
        placeholder="React 19 essentials"
      />
      <FieldDescription>The title shown across the app.</FieldDescription>
    </Field>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Resource name")).toBeInTheDocument();
    await expect(
      canvas.getByText("The title shown across the app."),
    ).toBeInTheDocument();
  },
};

/** Invalid state: `data-invalid` tints the field and `FieldError` renders messages. */
export const Invalid: Story = {
  render: () => (
    <Field data-invalid={true}>
      <FieldLabel htmlFor="resource-name-invalid">Resource name</FieldLabel>
      <Input
        id="resource-name-invalid"
        aria-invalid={true}
      />
      <FieldError
        errors={[{
          message: "Name is required",
        }]}
      />
    </Field>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Name is required",
    );
  },
};

/** Multiple related fields grouped under a legend. */
export const Grouped: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Resource details</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" />
        </Field>
        <Field>
          <FieldLabel htmlFor="url">URL</FieldLabel>
          <Input id="url" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Resource details")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Name")).toBeInTheDocument();
    await expect(canvas.getByLabelText("URL")).toBeInTheDocument();
  },
};
