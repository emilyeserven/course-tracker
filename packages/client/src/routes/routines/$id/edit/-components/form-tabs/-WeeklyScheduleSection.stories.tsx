import type { RoutineMode } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { WeeklyScheduleSection } from "./-WeeklyScheduleSection";

import { useRoutineDetailsForm } from "@/hooks/useRoutineDetailsForm";
import { makeRoutine } from "@/test-utils/boxFixtures";
import { makeRoutineTemplate } from "@/test-utils/routinesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";

// The section needs a live routine-details form; build one via the real hook so
// the form.Field wiring matches production.
function Host({
  mode,
}: { mode: RoutineMode }) {
  const {
    form,
    isDaily,
    taskOptions,
    resourceOptions,
    moduleGroupsByResource,
    modulesByResource,
  } = useRoutineDetailsForm(
    makeRoutine({
      mode,
    }),
    () => Promise.resolve(),
  );
  return (
    <WeeklyScheduleSection
      form={form}
      isDaily={isDaily}
      taskOptions={taskOptions}
      resourceOptions={resourceOptions}
      moduleGroupsByResource={moduleGroupsByResource}
      modulesByResource={modulesByResource}
    />
  );
}

const meta: Meta<typeof WeeklyScheduleSection> = {
  component: WeeklyScheduleSection,
  decorators: [
    queryStoryDecorator(
      seededQueryClient([
        [["tasks"], []],
        [["resources"], []],
        [["modules-all"], []],
        [["module-groups-all"], []],
        [["routineTemplates"], [makeRoutineTemplate()]],
      ]),
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Weekly mode: the 7-day schedule grid plus the Quick Fill template menu.
export const Weekly: Story = {
  render: () => <Host mode="weekly" />,
};

// Daily mode: a single repeated entry editor applied to every weekday.
export const Daily: Story = {
  render: () => <Host mode="daily" />,
};
