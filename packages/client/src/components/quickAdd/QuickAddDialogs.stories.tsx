import type { AppSettingsSummary } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, fn, within } from "storybook/test";

import { QuickAddDialogs } from "./QuickAddDialogs";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { queryKeys } from "@/utils/queryKeys";

// All six child dialogs mount at once; the Readwise/Todoist ones read settings
// via useQuery, so seed the cache (staleTime Infinity) to avoid a network call.
const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});
client.setQueryData(queryKeys.settings.detail(), {
  readwiseConfigured: true,
  readwiseKeyHint: "…aB3x",
  todoistConfigured: true,
  todoistKeyHint: "…aB3x",
  focusedDomainIds: [],
} satisfies AppSettingsSummary);

const meta: Meta<typeof QuickAddDialogs> = {
  component: QuickAddDialogs,
  args: {
    active: "resource",
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

// active="resource" opens the resource quick-add dialog (portaled to body).
export const ResourceActive: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Add Resource")).toBeInTheDocument();
  },
};

// Switching `active` opens a different dialog from the same mounted set.
export const ProviderActive: Story = {
  args: {
    active: "provider",
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Add Provider")).toBeInTheDocument();
  },
};

// active=null renders the set with every dialog closed.
export const Closed: Story = {
  args: {
    active: null,
  },
};
