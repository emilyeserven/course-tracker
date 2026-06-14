import type { AppSettingsSummary } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { QuickAddTodoistDialog } from "./QuickAddTodoistDialog";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { queryKeys } from "@/utils/queryKeys";

// Seed the settings query the hook reads via useQuery so the dialog renders the
// right branch without a network call. staleTime Infinity keeps the seed fresh.
function settingsClient(over: Partial<AppSettingsSummary> = {}): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(queryKeys.settings.detail(), {
    readwiseConfigured: false,
    readwiseKeyHint: null,
    todoistConfigured: false,
    todoistKeyHint: null,
    focusedDomainIds: [],
    ...over,
  } satisfies AppSettingsSummary);
  return client;
}

const meta: Meta<typeof QuickAddTodoistDialog> = {
  component: QuickAddTodoistDialog,
  args: {
    open: true,
    onOpenChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// With Todoist configured the create-task form is shown. Dialog portals to body.
export const Configured: Story = {
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub
          client={settingsClient({
            todoistConfigured: true,
          })}
        >
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Add Todoist task")).toBeInTheDocument();
    await expect(await body.findByLabelText("Title")).toBeInTheDocument();
    await expect(
      await body.findByRole("button", {
        name: "Add",
      }),
    ).toBeInTheDocument();
  },
};

// Without a Todoist key the dialog points the user to Settings. (The footer's
// "Close" button shares its accessible name with the dialog's built-in X, so we
// assert on the Settings link + helper text, which are unique to this branch.)
export const Unconfigured: Story = {
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub client={settingsClient()}>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Add Todoist task")).toBeInTheDocument();
    await expect(
      await body.findByText(/Add a Todoist API key in/),
    ).toBeInTheDocument();
    await expect(
      await body.findByRole("link", {
        name: "Settings",
      }),
    ).toBeInTheDocument();
  },
};
