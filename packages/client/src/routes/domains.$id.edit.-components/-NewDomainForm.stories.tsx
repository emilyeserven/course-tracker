import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { NewDomainForm } from "./-NewDomainForm";

import { RouterStub } from "@/test-utils/RouterStub";

const meta = {
  component: NewDomainForm,
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof NewDomainForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// The empty create form: title/description fields and the create action. We
// don't submit — that would call createDomain and navigate.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", {
        name: /new domain/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Domain Title")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /create domain/i,
      }),
    ).toBeInTheDocument();
  },
};
