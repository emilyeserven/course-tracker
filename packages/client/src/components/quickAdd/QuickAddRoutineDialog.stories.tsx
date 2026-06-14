import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { QuickAddRoutineDialog } from "./QuickAddRoutineDialog";

import { routerQueryDecorator } from "@/test-utils/quickAddStoryHelpers";

const meta: Meta<typeof QuickAddRoutineDialog> = {
  component: QuickAddRoutineDialog,
  args: {
    open: true,
    onOpenChange: fn(),
  },
  // useMutation + useNavigate (via useQuickAddRoutine) → QueryStub + RouterStub.
  decorators: [routerQueryDecorator()],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Dialog content portals to document.body; the mode radios default to weekly.
export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Add Routine")).toBeInTheDocument();
    await expect(await body.findByLabelText("Name")).toBeInTheDocument();
    await expect(
      await body.findByRole("radio", {
        name: "Weekly Schedule",
      }),
    ).toBeChecked();
    await expect(
      await body.findByRole("radio", {
        name: "Daily Task",
      }),
    ).toBeInTheDocument();
  },
};

// Naming the routine and choosing the daily mode enables Create.
export const SelectsDailyMode: Story = {
  play: async () => {
    const body = within(document.body);
    await userEvent.type(await body.findByLabelText("Name"), "Read for 30m");
    const daily = await body.findByRole("radio", {
      name: "Daily Task",
    });
    await userEvent.click(daily);
    await expect(daily).toBeChecked();
    await expect(
      await body.findByRole("button", {
        name: "Create",
      }),
    ).toBeEnabled();
  },
};
