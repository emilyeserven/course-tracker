import type { AppSettingsSummary } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { QuickAddDialogs } from "./QuickAddDialogs";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryKeys } from "@/utils/queryKeys";

// All six child dialogs mount at once; the Readwise/Todoist ones read settings
// via useQuery, so seed the cache (staleTime Infinity) to avoid a network call.
const client = seededQueryClient([
  [
    queryKeys.settings.detail(),
    {
      readwiseConfigured: true,
      readwiseKeyHint: "…aB3x",
      todoistConfigured: true,
      todoistKeyHint: "…aB3x",
    } satisfies AppSettingsSummary,
  ],
]);

const meta: Meta<typeof QuickAddDialogs> = {
  component: QuickAddDialogs,
  args: {
    active: "task",
    onClose: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={client}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// active="task" opens the task quick-add dialog (portaled to body).
export const TaskActive: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Add Task")).toBeInTheDocument();
  },
};

// active=null renders the set with every dialog closed.
export const Closed: Story = {
  args: {
    active: null,
  },
};
