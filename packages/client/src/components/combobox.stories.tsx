import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox";

const FRUITS = ["Apple", "Banana", "Cherry"];

function ComboboxDemo({
  defaultOpen,
}: { defaultOpen?: boolean }) {
  return (
    <Combobox
      items={FRUITS}
      defaultOpen={defaultOpen}
    >
      <ComboboxInput placeholder="Pick a fruit" />
      <ComboboxContent>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem
              key={item}
              value={item}
            >
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

const meta: Meta<typeof ComboboxDemo> = {
  component: ComboboxDemo,
};

export default meta;

type Story = StoryObj<typeof meta>;

// Closed: only the input is shown.
export const Closed: Story = {};

// Open: the list portals to document.body and shows every option.
export const Open: Story = {
  args: {
    defaultOpen: true,
  },
};
