import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { DetailsTab } from "./-DetailsTab";

import { makeRoutine } from "@/test-utils/boxFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { makeRoutineTemplate } from "@/test-utils/routinesFixtures";

// useRoutineDetailsForm reads topics/tasks/resources for its combobox options,
// and the weekly-mode Quick Fill menu reads the routine templates. Empty lists
// are enough — the form renders its fields regardless.
function seededClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(["topics"], []);
  client.setQueryData(["tasks"], []);
  client.setQueryData(["resources"], []);
  client.setQueryData(["routineTemplates"], [makeRoutineTemplate()]);
  return client;
}

const meta: Meta<typeof DetailsTab> = {
  component: DetailsTab,
  args: {
    routine: makeRoutine(),
    onSaved: fn(() => Promise.resolve()),
    onChangeStateChange: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={seededClient()}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Daily mode (the fixture default): name/type/status fields and the single-item
// daily editor.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByDisplayValue("Daily reading"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Routine Name")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save details/i,
      }),
    ).toBeInTheDocument();
  },
};

// Weekly mode swaps in the full weekly schedule grid + the Quick Fill menu.
export const Weekly: Story = {
  args: {
    routine: makeRoutine({
      mode: "weekly",
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // The Quick Fill menu is rendered only in weekly mode (the schedule grid),
    // so it's the unambiguous signal the weekly branch is active.
    await expect(
      await canvas.findByRole("button", {
        name: /quick fill/i,
      }),
    ).toBeInTheDocument();
  },
};
