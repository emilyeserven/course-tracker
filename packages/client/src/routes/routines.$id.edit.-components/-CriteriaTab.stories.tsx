import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { CriteriaTab } from "./-CriteriaTab";

import { makeRoutine } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeCriteriaTemplate } from "@/test-utils/templatesFixtures";

// The embedded Quick Fill menu reads the criteria templates.
function seededClient() {
  return seededQueryClient([
    [["dailyCriteriaTemplates"], [makeCriteriaTemplate()]],
  ]);
}

const meta: Meta<typeof CriteriaTab> = {
  component: CriteriaTab,
  args: {
    routine: makeRoutine(),
    onSaved: fn(() => Promise.resolve()),
    onChangeStateChange: fn(),
  },
  decorators: [
    Story => (
      <QueryStub client={seededClient()}>
        <Story />
      </QueryStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// The five per-status criteria textareas plus the Quick Fill + save controls.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Incomplete")).toBeInTheDocument();
    await expect(canvas.getByText("Completed (Goal)")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save status criteria/i,
      }),
    ).toBeInTheDocument();
  },
};

// A routine with persisted criteria hydrates the textareas from its values.
export const WithCriteria: Story = {
  args: {
    routine: makeRoutine({
      criteria: {
        incomplete: "Skipped today.",
        touched: "Did a little.",
        goal: "Hit the goal.",
        exceeded: "Went above and beyond.",
        freeze: "Rest day.",
      },
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByDisplayValue("Hit the goal."),
    ).toBeInTheDocument();
  },
};
