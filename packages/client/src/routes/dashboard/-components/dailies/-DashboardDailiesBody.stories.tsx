import type { DashboardDailiesData } from "./-useDashboardDailies";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DashboardDailiesBody } from "./-DashboardDailiesBody";

import { makeDaily } from "@/test-utils/dailiesFixtures";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { getTodayKey } from "@/utils";

// A minimal stand-in for the hook's return value: the body only reads
// mode/mutation/dayHeaders/todayKey/sorting/onSortingChange.
const data = {
  bucket: () => [],
  isPending: false,
  error: null,
  hasData: true,
  activeCount: 1,
  dayHeaders: [],
  todayKey: getTodayKey(),
  mode: "list",
  setMode: fn(),
  sorting: [],
  onSortingChange: fn(),
  mutation: {
    isPending: false,
    mutate: fn(),
  },
  maxActiveDailies: 5,
} as unknown as DashboardDailiesData;

const meta: Meta<typeof DashboardDailiesBody> = {
  component: DashboardDailiesBody,
  args: {
    list: [makeDaily()],
    data,
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// List mode: the active-list view of a dailies bucket.
export const ListMode: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Morning reading"),
    ).toBeInTheDocument();
  },
};
