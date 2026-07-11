import type { Meta, StoryObj } from "@storybook/react-vite";

import { CuratedScheduleSection } from "./-CuratedScheduleSection";

import { useRoutineDetailsForm } from "@/hooks/useRoutineDetailsForm";
import { makeRoutine } from "@/test-utils/boxFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";

// A live routine-details form in curated mode, built via the real hook so the
// end-date window and per-day schedule wiring match production.
function Host() {
  const {
    form,
    setCuratedEndDate,
    curatedWindow,
    taskOptions,
    resourceOptions,
    moduleGroupsByResource,
    modulesByResource,
  } = useRoutineDetailsForm(
    makeRoutine({
      mode: "curated",
    }),
    () => Promise.resolve(),
  );
  return (
    <CuratedScheduleSection
      form={form}
      setCuratedEndDate={setCuratedEndDate}
      curatedWindow={curatedWindow}
      taskOptions={taskOptions}
      resourceOptions={resourceOptions}
      moduleGroupsByResource={moduleGroupsByResource}
      modulesByResource={modulesByResource}
    />
  );
}

const meta: Meta<typeof CuratedScheduleSection> = {
  component: CuratedScheduleSection,
  render: () => <Host />,
  decorators: [
    queryStoryDecorator(
      seededQueryClient([
        [["tasks"], []],
        [["resources"], []],
        [["modules-all"], []],
        [["module-groups-all"], []],
      ]),
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
