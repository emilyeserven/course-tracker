import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, screen, userEvent, within } from "storybook/test";

import { QuickFillMenu } from "./-QuickFillMenu";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeRoutineTemplate } from "@/test-utils/routinesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeCriteriaTemplate } from "@/test-utils/templatesFixtures";

// Seeds one template list so the menu renders its items without a network call.
function clientWith(key: string, data: unknown) {
  return seededQueryClient([[[key], data]]);
}

// Each story opens the menu the same way (click the trigger) before asserting on
// its contents.
async function openQuickFill(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", {
    name: /quick fill/i,
  }));
}

const meta: Meta<typeof QuickFillMenu> = {
  component: QuickFillMenu,
  args: {
    onSelect: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Routine kind: opens the menu and applies a chosen weekly template.
export const RoutineTemplates: Story = {
  args: {
    kind: "routine",
  },
  decorators: [
    Story => (
      <QueryStub client={clientWith("routineTemplates", [makeRoutineTemplate()])}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement, args,
  }) => {
    await openQuickFill(canvasElement);
    const item = await screen.findByText("Summer Japanese");
    await userEvent.click(item);
    await expect(args.onSelect).toHaveBeenCalled();
  },
};

// Criteria kind fetches the criteria templates instead.
export const CriteriaTemplates: Story = {
  args: {
    kind: "criteria",
  },
  decorators: [
    Story => (
      <QueryStub
        client={clientWith("dailyCriteriaTemplates", [makeCriteriaTemplate()])}
      >
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    await openQuickFill(canvasElement);
    await expect(await screen.findByText("Reading goals")).toBeInTheDocument();
  },
};

// With no templates the menu shows a disabled hint pointing at Settings.
export const NoTemplates: Story = {
  args: {
    kind: "routine",
  },
  decorators: [
    Story => (
      <QueryStub client={clientWith("routineTemplates", [])}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    await openQuickFill(canvasElement);
    await expect(await screen.findByText(/no templates/i)).toBeInTheDocument();
  },
};
