import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { TodoistSection } from "./-TodoistSection";

import { QueryStub } from "@/test-utils/QueryStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeAppSettings } from "@/test-utils/settingsFixtures";
import { queryKeys } from "@/utils/queryKeys";

function seededClient() {
  return seededQueryClient([[queryKeys.settings.detail(), makeAppSettings()]]);
}

const meta = {
  component: TodoistSection,
  decorators: [
    Story => (
      <QueryStub client={seededClient()}>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof TodoistSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The Todoist integration wraps IntegrationKeySection with its preset copy.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: "Todoist",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save key/i,
      }),
    ).toBeInTheDocument();
  },
};
