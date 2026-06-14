import type { AppSettingsSummary } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { QuickAddReadwiseDialog } from "./QuickAddReadwiseDialog";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryKeys } from "@/utils/queryKeys";

// Seed the settings query the dialog reads via useQuery so it renders the right
// branch without a network call.
function settingsClient(over: Partial<AppSettingsSummary> = {}) {
  return seededQueryClient([
    [
      queryKeys.settings.detail(),
      {
        readwiseConfigured: false,
        readwiseKeyHint: null,
        todoistConfigured: false,
        todoistKeyHint: null,
        focusedDomainIds: [],
        ...over,
      } satisfies AppSettingsSummary,
    ],
  ]);
}

const meta: Meta<typeof QuickAddReadwiseDialog> = {
  component: QuickAddReadwiseDialog,
  args: {
    open: true,
    onOpenChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// With Readwise configured the save form is shown. Dialog portals to body.
export const Configured: Story = {
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub
          client={settingsClient({
            readwiseConfigured: true,
          })}
        >
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Save to Readwise")).toBeInTheDocument();
    await expect(await body.findByLabelText("URL")).toBeInTheDocument();
    await expect(
      await body.findByRole("button", {
        name: "Save",
      }),
    ).toBeInTheDocument();
  },
};

// Without a Readwise key the dialog points the user to Settings. (The footer's
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
    await expect(await body.findByText("Save to Readwise")).toBeInTheDocument();
    await expect(
      await body.findByText(/Add a Readwise API key in/),
    ).toBeInTheDocument();
    await expect(
      await body.findByRole("link", {
        name: "Settings",
      }),
    ).toBeInTheDocument();
  },
};
