import type { Meta, StoryObj } from "@storybook/react-vite";

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

export const Default: Story = {};

export const SelectAnother: Story = {};
