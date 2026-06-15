import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { UrlAndPagesFields } from "./UrlAndPagesFields";

const meta: Meta<typeof UrlAndPagesFields> = {
  component: UrlAndPagesFields,
  args: {
    draft: {
      url: "",
      pageStart: "",
      pageEnd: "",
    },
    onChange: fn(),
  },
  decorators: [
    Story => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Location: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Location (optional)")).toBeInTheDocument();
    await expect(canvas.queryByText("Start page (optional)")).toBeNull();
  },
};

export const WithPages: Story = {
  args: {
    showPages: true,
    draft: {
      url: "https://example.com/book",
      pageStart: "42",
      pageEnd: "58",
    },
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("URL (optional)")).toBeInTheDocument();
    await expect(canvas.getByText("Start page (optional)")).toBeInTheDocument();
    await expect(canvas.getByText("End page (optional)")).toBeInTheDocument();
  },
};
