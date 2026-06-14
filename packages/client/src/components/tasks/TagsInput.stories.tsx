import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { TagsInput } from "./TagsInput";

const meta: Meta<typeof TagsInput> = {
  component: TagsInput,
  args: {
    value: ["react", "typescript"],
    onChange: fn(),
    suggestions: ["lang:python", "lang:rust", "tooling:vite"],
  },
  decorators: [
    Story => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

/** Current free-text tags render as chips. */
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("react")).toBeInTheDocument();
    await expect(canvas.getByText("typescript")).toBeInTheDocument();
  },
};

/** With nothing selected the input shows its placeholder. */
export const Empty: Story = {
  args: {
    value: [],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("Add a tag...")).toBeInTheDocument();
  },
};

/** Typing a new tag and pressing Enter commits it via `onChange`. */
export const AddNewTag: Story = {
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Add a tag...");
    await userEvent.type(input, "graphql{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith([
      "react",
      "typescript",
      "graphql",
    ]);
  },
};
