import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { TaskResourceComboboxContent } from "./TaskResourceComboboxContent";

import { Combobox, ComboboxInput } from "@/components/ui/combobox";

const optionsMap = new Map([
  ["task-1", "Read a chapter"],
  ["task-2", "Write practice exercises"],
]);

const meta: Meta<typeof TaskResourceComboboxContent> = {
  component: TaskResourceComboboxContent,
  args: {
    optionsMap,
  },
  // The content is a base-ui combobox popup: it portals to the body and only
  // renders inside an open Combobox root. Wrap it in one (open) so the dropdown
  // body — and the "Add resource" row — is visible. Items come from the args'
  // optionsMap so the list and the content stay in sync.
  decorators: [
    (Story, ctx) => (
      <Combobox
        items={[...ctx.args.optionsMap.keys()]}
        defaultOpen
        itemToStringLabel={(val: string) => ctx.args.optionsMap.get(val) ?? ""}
      >
        <ComboboxInput />
        <Story />
      </Combobox>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Popup content portals to document.body, so assert via within(document.body).
export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Read a chapter")).toBeInTheDocument();
    await expect(body.getByText("Write practice exercises")).toBeInTheDocument();
  },
};

// With onAddNew, a pinned "Add resource" row sits above the results and fires the
// callback on click.
export const WithAddNew: Story = {
  args: {
    onAddNew: fn(),
  },
  play: async ({
    args,
  }) => {
    const body = within(document.body);
    const addButton = await body.findByRole("button", {
      name: "Add resource",
    });
    await userEvent.click(addButton);
    await expect(args.onAddNew).toHaveBeenCalled();
  },
};
