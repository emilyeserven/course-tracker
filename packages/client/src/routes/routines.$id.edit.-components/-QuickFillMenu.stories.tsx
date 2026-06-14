import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, screen, userEvent, within } from "storybook/test";

import { QuickFillMenu } from "./-QuickFillMenu";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeRoutineTemplate } from "@/test-utils/routinesFixtures";
import { makeCriteriaTemplate } from "@/test-utils/templatesFixtures";

// Seeds one template list so the menu renders its items without a network call.
function clientWith(key: string, data: unknown) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData([key], data);
  return client;
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
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: /quick fill/i,
      }),
    );
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
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: /quick fill/i,
      }),
    );
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
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: /quick fill/i,
      }),
    );
    await expect(
      await screen.findByText(/no templates/i),
    ).toBeInTheDocument();
  },
};
