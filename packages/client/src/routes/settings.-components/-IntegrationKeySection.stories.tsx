import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { IntegrationKeySection } from "./-IntegrationKeySection";

import { QueryStub } from "@/test-utils/QueryStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeAppSettings } from "@/test-utils/settingsFixtures";
import { queryKeys } from "@/utils/queryKeys";

// Seeds the settings detail the section reads so the configured/unconfigured
// banner resolves without a network call.
function clientWith(settings = makeAppSettings()) {
  return seededQueryClient([[queryKeys.settings.detail(), settings]]);
}

const meta = {
  component: IntegrationKeySection,
  args: {
    title: "Readwise",
    placeholder: "Paste your Readwise token",
    description: "Connect your Readwise account to show your reading list.",
    buildUpdate: (key: string | null) => ({
      readwiseApiKey: key,
    }),
    selectStatus: data => ({
      configured: data?.readwiseConfigured ?? false,
      hint: data?.readwiseKeyHint ?? null,
    }),
    dataQueryKey: queryKeys.readwise.readingList(),
  },
  decorators: [
    Story => (
      <QueryStub client={clientWith()}>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof IntegrationKeySection>;

export default meta;

type Story = StoryObj<typeof meta>;

// No key saved yet: the input plus a "Save key" action.
export const Unconfigured: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: "Readwise",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save key/i,
      }),
    ).toBeInTheDocument();
  },
};

// A saved key surfaces the masked hint plus Update/Remove actions.
export const Configured: Story = {
  decorators: [
    Story => (
      <QueryStub
        client={clientWith(
          makeAppSettings({
            readwiseConfigured: true,
            readwiseKeyHint: "aB3x",
          }),
        )}
      >
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/ending aB3x/i),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /remove/i,
      }),
    ).toBeInTheDocument();
  },
};
