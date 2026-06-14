import type { Meta, StoryObj } from "@storybook/react-vite";

import { SearchIcon } from "lucide-react";
import { expect, within } from "storybook/test";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";

function InputGroupDemo() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Go</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

const meta: Meta<typeof InputGroupDemo> = {
  component: InputGroupDemo,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("Search...")).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Go",
    })).toBeInTheDocument();
  },
};
