import type { Meta, StoryObj } from "@storybook/react-vite";

import { IntegrationKeySection } from "./-IntegrationKeySection";

import { seededSettingsClient } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";
import { queryKeys } from "@/utils/queryKeys";

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
  decorators: [queryStubDecorator(seededSettingsClient)],
} satisfies Meta<typeof IntegrationKeySection>;

export default meta;

type Story = StoryObj<typeof meta>;

// No key saved yet: the input plus a "Save key" action.
export const Unconfigured: Story = {
  play: smokePlay([
    {
      role: "heading",
      name: "Readwise",
    },
    {
      role: "button",
      name: /save key/i,
    },
  ]),
};

// A saved key surfaces the masked hint plus Update/Remove actions.
export const Configured: Story = {
  decorators: [
    queryStubDecorator(() =>
      seededSettingsClient({
        readwiseConfigured: true,
        readwiseKeyHint: "aB3x",
      })),
  ],
  play: smokePlay([
    {
      text: /ending aB3x/i,
    },
    {
      role: "button",
      name: /remove/i,
    },
  ]),
};
