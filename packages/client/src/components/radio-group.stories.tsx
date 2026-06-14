import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { RadioGroup, RadioGroupItem } from "./radio-group";

const OPTIONS = ["comfortable", "compact", "spacious"];

function RadioGroupDemo({
  defaultValue,
}: { defaultValue?: string }) {
  return (
    <RadioGroup defaultValue={defaultValue}>
      {OPTIONS.map(value => (
        <label
          key={value}
          className="flex items-center gap-2 text-sm"
        >
          <RadioGroupItem
            value={value}
            aria-label={value}
          />
          {value}
        </label>
      ))}
    </RadioGroup>
  );
}

const meta: Meta<typeof RadioGroupDemo> = {
  component: RadioGroupDemo,
  args: {
    defaultValue: "comfortable",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const options = canvas.getAllByRole("radio");
    await expect(options).toHaveLength(3);
    await expect(
      canvas.getByRole("radio", {
        name: "comfortable",
      }),
    ).toBeChecked();
  },
};

export const SelectAnother: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const compact = canvas.getByRole("radio", {
      name: "compact",
    });
    await userEvent.click(compact);
    await expect(compact).toBeChecked();
  },
};
