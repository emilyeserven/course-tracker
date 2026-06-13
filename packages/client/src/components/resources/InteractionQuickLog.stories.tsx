import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { InteractionQuickLog } from "./InteractionQuickLog";

import { QueryStub } from "@/test-utils/QueryStub";

const meta: Meta<typeof InteractionQuickLog> = {
  component: InteractionQuickLog,
  args: {
    resourceId: "resource-1",
    scopeLabel: "module: Getting Started",
    onCancel: fn(),
    onSaved: fn(),
  },
  decorators: [
    Story => (
      <QueryStub>
        <div className="max-w-xl">
          <Story />
        </div>
      </QueryStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // Clicking Cancel (not submit) avoids firing the real network mutation.
  play: async ({
    args,
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("module: Getting Started"),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Cancel",
      }),
    );
    await expect(args.onCancel).toHaveBeenCalled();
  },
};

export const NoScope: Story = {
  args: {
    scopeLabel: undefined,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Log",
      }),
    ).toBeInTheDocument();
  },
};
