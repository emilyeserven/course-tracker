import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DetailsTab } from "./-DetailsTab";

import { makeRoutine } from "@/test-utils/boxFixtures";
import { makeRoutineTemplate } from "@/test-utils/routinesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta: Meta<typeof DetailsTab> = {
  component: DetailsTab,
  args: {
    routine: makeRoutine(),
    onSaved: fn(() => Promise.resolve()),
    onChangeStateChange: fn(),
  },
  // useRoutineDetailsForm reads topics/tasks/resources for its combobox options,
  // and the weekly-mode Quick Fill menu reads the routine templates. Empty lists
  // are enough — the form renders its fields regardless.
  decorators: [
    queryStoryDecorator(
      seededQueryClient([
        [["topics"], []],
        [["tasks"], []],
        [["resources"], []],
        [["routineTemplates"], [makeRoutineTemplate()]],
      ]),
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Daily mode (the fixture default): name/type/status fields and the single-item
// daily editor.
export const Default: Story = {
  play: smokePlay([
    {
      displayValue: "Daily reading",
    },
    {
      text: "Routine Name",
    },
    {
      role: "button",
      name: /save details/i,
    },
  ]),
};

// Weekly mode swaps in the full weekly schedule grid + the Quick Fill menu.
export const Weekly: Story = {
  args: {
    routine: makeRoutine({
      mode: "weekly",
    }),
  },
  // The Quick Fill menu is rendered only in weekly mode (the schedule grid), so
  // it's the unambiguous signal the weekly branch is active.
  play: smokePlay([{
    role: "button",
    name: /quick fill/i,
  }]),
};
