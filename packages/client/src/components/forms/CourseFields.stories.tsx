import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { CourseFields } from "./CourseFields";

import { useAppForm } from "@/hooks/useAppForm";

/**
 * `CourseFields` takes a whole `form`, so it can't use the single-field
 * `FormFieldHarness`. This wrapper builds a real form (matching the `course0Name`
 * / `course0Url` fields it renders) and bridges TanStack Form's invariant
 * generics the same way the onboarding route does.
 */
function CourseFieldsHarness({
  condition,
  name,
  label,
}: {
  condition: boolean;
  name: string;
  label: string;
}) {
  const form = useAppForm({
    defaultValues: {
      course0Name: "",
      course0Url: "",
    },
  });
  return (
    <CourseFields
      form={form as unknown as ReturnType<typeof useAppForm>}
      condition={condition}
      name={name}
      label={label}
    />
  );
}

// Typed against the harness (which renders the real `CourseFields` below) so the
// required `form` prop stays out of the story args — it's supplied internally.
const meta = {
  component: CourseFieldsHarness,
  args: {
    condition: true,
    name: "course0",
    label: "React",
  },
  decorators: [
    Story => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CourseFieldsHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("React")).toBeInTheDocument();
    await expect(canvas.getByText("Resource Name")).toBeInTheDocument();
    await expect(canvas.getByText("Resource URL")).toBeInTheDocument();
  },
};

/** When `condition` is false the section renders nothing. */
export const Hidden: Story = {
  args: {
    condition: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Resource Name")).not.toBeInTheDocument();
  },
};
